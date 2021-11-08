class TipsWidget extends HTMLElement {
  constructor() {
    super();
  }

  cart = null;
  product = null;
  tipsWidget = document.getElementById("tips");
  cartItemsElement = document.getElementsByTagName("cart-items")[0];
  lineItemStatusElement = document.getElementById('shopping-cart-line-item-status');
  observer = null;
  ticking = false;

  connectedCallback() {
    this.setupTipOptions();
    this.setupLoadListener();
    this.setupObserver();
    this.setupScrollListener();
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  setupTipOptions() {
    document.tipOptionChecked = {
      "tip-option": null,
    };
    document.radioClick = async (event) => {
      this.disableRadioButtons();
      const tipOptionElement = event.target;
      if (event.keyCode)
        return (tipOptionElement.checked = event.keyCode !== 32);
      tipOptionElement.checked =
        document.tipOptionChecked["tip-option"] !== tipOptionElement;

      let prevTipOptionId = document.tipOptionChecked["tip-option"]?.id;
      document.tipOptionChecked["tip-option"] = tipOptionElement.checked
        ? tipOptionElement
        : null;
      let currentTipOptionId = document.tipOptionChecked["tip-option"]?.id;
      if (prevTipOptionId && currentTipOptionId) {
        this.cartItemsElement.enableLoading(this.cart.items.length);
      }
      if (prevTipOptionId) {
        let prevTipOptionNumber = prevTipOptionId.split("-")[1];
        this.cart = await this.removeTipFromCart(prevTipOptionNumber);
      }
      if (currentTipOptionId) {
        let currentTipOptionNumber = currentTipOptionId.split("-")[1];
        this.cart = await this.addTipToCart(currentTipOptionNumber);
      }
      if (prevTipOptionId || currentTipOptionId) {
        this.refreshCart();
      }
      this.cartItemsElement.disableLoading();
      this.enableRadioButtons();
    };
    document.querySelectorAll("input[type='radio']").forEach((radio) => {
      radio.setAttribute("onclick", "radioClick(event)");
      radio.setAttribute("onkeyup", "radioClick(event)");
    });
  }

  disableRadioButtons() {
    document.querySelectorAll("input[type='radio']").forEach((radio) => {
      radio.disabled = true;
    });
  }

  enableRadioButtons() {
    document.querySelectorAll("input[type='radio']").forEach((radio) => {
      radio.disabled = false;
    });
  }

  setupLoadListener() {
    const open = window.XMLHttpRequest.prototype.open;
    const self = this;
    window.XMLHttpRequest.prototype.open = function () {
      this.addEventListener("load", self.handleLoad);
      return open.apply(this, arguments);
    };
  }

  setupObserver() {
    setTimeout(() => {
      const config = {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      };
      this.observer = new MutationObserver(this.mutationCallback);
      this.observer.observe(document, config);
    }, 1000);
  }

  setupScrollListener() {
    document.addEventListener("scroll", () => {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          const pageHalf = this.getVisiblePageHalf();
          this.setTooltipPosition(pageHalf);
          this.ticking = false;
        });

        this.ticking = true;
      }
    });
  }

  getVisiblePageHalf() {
    const offset = this.tipsWidget.getBoundingClientRect().top;
    const halfPage = window.innerHeight / 2;
    if (offset < halfPage) {
      return "top";
    } else {
      return "bottom";
    }
  }

  setTooltipPosition(pageHalf) {
    const tooltipText = document.getElementById("tooltip-text");
    if (pageHalf === "top") {
      tooltipText.classList.remove("top");
      tooltipText.classList.add("bottom");
    } else {
      tooltipText.classList.remove("bottom");
      tooltipText.classList.add("top");
    }
  }

  handleLoad = async () => {
    await this.syncCart();
    this.product = await this.getProduct();
  };

  getCart = async () => {
    const url = "/cart.js";
    const params = { method: "GET" };
    const response = await fetch(url, params);
    return await response.json();
  };

  getProduct = async () => {
    const url = "/products/fulfillment-tip.js";
    const params = { method: "GET" };
    const response = await fetch(url, params);
    return await response.json();
  };

  mutationCallback = async (mutationsList, _observer) => {
    const childListMutations = mutationsList.filter(
      (mutation) => mutation.type === "childList"
    );
    if (childListMutations.length) {
      await this.syncCart();
    }
  };

  addTipToCart = async (tipOptionNumber) => {
    await fetch("/cart/clear.js", { method: "POST" });
    const currentItems = this.cart.items.map(({ id, quantity }) => {
      return { id, quantity };
    });
    const tipId = this.product.variants[tipOptionNumber - 1].id;
    const formData = {
      items: [
        {
          id: tipId,
          quantity: 1,
        },
        ...currentItems,
      ],
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    };
    const url = "/cart/add.js";
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    };
    const response = await fetch(url, params);
    return await response.json();
  };

  removeTipFromCart = async (tipOptionNumber) => {
    const tipId = this.product.variants[tipOptionNumber - 1].id;
    const formData = {
      updates: { [tipId]: 0 },
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    };
    const url = "/cart/update.js";
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    };
    const response = await fetch(url, params);
    return await response.json();
  };

  syncCart = async () => {
    this.cart = await this.getCart();
    const tipOption = this.cart.items.find(
      ({ handle }) => handle === "fulfillment-tip"
    );
    const tipOptionId = tipOption?.options_with_values[0].value;
    if (tipOptionId && !document.tipOptionChecked["tip-option"]) {
      const tipOptionElement = document.getElementById(`radio-${tipOptionId}`);
      tipOptionElement.checked = true;
      document.tipOptionChecked["tip-option"] = tipOptionElement;
    }
    if (!tipOptionId && document.tipOptionChecked["tip-option"]) {
      const tipOptionElement = document.tipOptionChecked["tip-option"];
      tipOptionElement.checked = false;
      document.tipOptionChecked["tip-option"] = null;
    }
    if (this.cart.items.length === 1 && tipOptionId) {
      this.cart = await this.removeTipFromCart(tipOptionId);
      this.refreshCart();
    }
    document.getElementById("tips").style.display = this.cart.item_count
      ? "block"
      : "none";
  };

  refreshCart() {
    if (this.cartItemsElement) this.cartItemsElement.classList.toggle(
      "is-empty",
      this.cart.item_count === 0
    );
    const cartFooter = document.getElementById("main-cart-footer");
    if (cartFooter)
      cartFooter.classList.toggle("is-empty", this.cart.item_count === 0);
    this.getSectionsToRender().forEach((section) => {
      const elementToReplace =
        document.getElementById(section.id)?.querySelector(section.selector) ||
        document.getElementById(section.id);
      if (elementToReplace) elementToReplace.innerHTML = this.getSectionInnerHTML(
        this.cart.sections[section.section],
        section.selector
      );
    });
    this.updateLiveRegions();
    document.activeElement.focus();
  }

  updateLiveRegions() {
    if (this.lineItemStatusElement) this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text');
    if (cartStatus) cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      if (cartStatus) cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById("main-cart-items");
    if (mainCartItems) mainCartItems.classList.add('cart__items--disabled');
    if (line) document.querySelectorAll(`#CartItem-${line} .loading-overlay`).forEach((overlay) => overlay.classList.remove('hidden'));
    document.activeElement.blur();
    if (this.lineItemStatusElement) this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    const mainCartItems = document.getElementById("main-cart-items");
    if (mainCartItems) mainCartItems.classList.remove('cart__items--disabled');
  }

  getSectionsToRender() {
    return [
      {
        id: "main-cart-items",
        section: document.getElementById("main-cart-items")?.dataset.id,
        selector: ".js-contents",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
      {
        id: "cart-live-region-text",
        section: "cart-live-region-text",
        selector: ".shopify-section",
      },
      {
        id: "main-cart-footer",
        section: document.getElementById("main-cart-footer")?.dataset.id,
        selector: ".js-contents",
      },
    ];
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector)?.innerHTML;
  }
}

customElements.define("tips-widget", TipsWidget);
