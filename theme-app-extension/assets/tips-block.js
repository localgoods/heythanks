// Todo: see line 74

let hasSeenOverlay = false;
let product = null;
let cart = null;
let cartItemsId = null;
let cartFooterId = null;

function showOverlay() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("recommendation").style.display = "block";
  document.getElementById("close").style.display = "block";
}

function hideOverlay() {
  document.getElementById("recommendation").style.display = "none";
  document.getElementById("close").style.display = "none";
  document.getElementById("overlay").style.display = "none";

  hasSeenOverlay = true;
}

function setupOverlay() {
  if (!hasSeenOverlay) {
    showOverlay();
  }
}

function setupRadioButtons() {
  document.radioChecked = {};
  document.radioClick = async function (event) {
    const obj = event.target,
      name = obj.name || "unnamed";
    if (event.keyCode) return (obj.checked = event.keyCode !== 32);
    obj.checked = document.radioChecked[name] !== obj;

    let prevTipOptionId = document.radioChecked[name]?.id;
    document.radioChecked[name] = obj.checked ? obj : null;
    let currentTipOptionId = document.radioChecked[name]?.id;

    if (prevTipOptionId) {
      let prevTipOptionNumber = prevTipOptionId.split("-")[1];
      const { sections } = await removeTipFromCart(prevTipOptionNumber);
      replaceSections(sections);
    }
    if (currentTipOptionId) {
      let currentTipOptionNumber = currentTipOptionId.split("-")[1];
      const { sections } = await addTipToCart(currentTipOptionNumber);
      replaceSections(sections);
    }
  };
  document.querySelectorAll("input[type='radio']").forEach((radio) => {
    radio.setAttribute("onclick", "radioClick(event)");
    radio.setAttribute("onkeyup", "radioClick(event)");
  });
}

async function handleLoad() {

  console.log("HANDLE LOAD")

  cart = await getCart();

  product = await getProduct();

  // Todo: clear cart when tip is only item
  // Todo: make product last in list
  // Todo: make product more appealing (image, option name, etc)
  // Todo: move hasSeenOverlay to persistent storage

  if (cart.item_count > 0) {
    document.getElementById("tips").style.display = "block";
    document.getElementById("design").style.display = "none";
    if (cart.items.length === 1 && cart.items[0].handle === "fulfillment-tip") {
      const { sections } = await removeTipFromCart(cart.items[0].id);
      replaceSections(sections);
      document.getElementById("tips").style.display = "none";
      document.getElementById("design").style.display = "block";
    }
  } else {
    document.getElementById("tips").style.display = "none";
    document.getElementById("design").style.display = "block";
  }
}

function handleReorder() {
  if (!hasSeenOverlay) {
    hideOverlay();
  }
}

async function getProduct() {
  const url = "/products/fulfillment-tip.js";
  const params = { method: "GET" };
  const response = await fetch(url, params);
  return await response.json();
}

async function getCart() {
  const url = "/cart.js";
  const params = { method: "GET" };
  const response = await fetch(url, params);
  return await response.json();
}

function setupCartSectionIds() {
  const sections = document.getElementsByClassName("shopify-section");
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.id.includes("cart-items")) {
      cartItemsId = section.id.split("shopify-section-")[1];
    }
    if (section.id.includes("cart-footer")) {
      cartFooterId = section.id.split("shopify-section-")[1];
    }
  }
}

function replaceSections(sections) {
  document.getElementsByTagName("cart-items").forEach((element) => {
    const event = {
      target: {
        dataset: {
          index: 1
        },
        value: 0
      }
    }
    element.onChange(event);
  });

  // Object.keys(sections).forEach((key) => {
  //   const id = key.includes("cart-items") || key.includes("cart-footer") ? `shopify-section-${key}` : key;
  //   const element = document.getElementById(id);
  //   const value = sections[key];
  //   if (element && value) element.innerHTML = value;
  // });
}

async function addTipToCart(tipOptionNumber) {
  const sections = `${cartItemsId},${cartFooterId},cart-icon-bubble,cart-live-region-text`;
  const tipId = product.variants[tipOptionNumber - 1].id;
  const formData = {
    items: [
      {
        id: tipId,
        quantity: 1
      },
    ],
    sections
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
}

async function removeTipFromCart(tipOptionNumber) {
  const sections = `${cartItemsId},${cartFooterId},cart-icon-bubble,cart-live-region-text`;
  const tipId = product.variants[tipOptionNumber - 1].id;
  const formData = {
    updates: { [tipId]: 0 },
    sections
  }
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
}

class TipsBlock extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    setupCartSectionIds();
    setupOverlay();
    setupRadioButtons();
    document.addEventListener("shopify:section:reorder", handleReorder);

    const open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function() {
      this.addEventListener("load", handleLoad);
      return open.apply(this, arguments);
    };
  }

  disconnectedCallback() {
    console.log("disconnect");
    document.removeEventListener("shopify:section:reorder", handleReorder);
  }
}

customElements.define("tips-block", TipsBlock);
