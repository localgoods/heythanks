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
        this.setupCart();
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

    async setupCart() {
        this.cart = await this.getCart();
        this.product = await this.getProduct();
        await this.syncCart();
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
        this.cart = await this.getCart();
        this.product = await this.getProduct();
        await this.syncCart();
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
            this.cart = await this.getCart();
            this.product = await this.getProduct();
            await this.syncCart();
        }
    };

    addTipToCart = async (tipOptionNumber) => {
        if (!this.cart) this.cart = await this.getCart();
        if (!this.product) this.product = await this.getProduct();
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
        if (!this.cart) this.cart = await this.getCart();
        if (!this.product) this.product = await this.getProduct();
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
        const sections = [
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
        return sections;
    }

    getSectionInnerHTML(html, selector) {
        return new DOMParser()
            .parseFromString(html, "text/html")
            .querySelector(selector)?.innerHTML;
    }
}

customElements.define("tips-widget", TipsWidget);

// Todo we can make this a user defined selection through Shopify metafields
// Place the tips widget just above the cart subtotal in Spotted By Humphrey
const cartSubtotal = document.getElementsByClassName("cart_subtotal")[0];
const cartSubtotalParent = cartSubtotal.parentNode;
cartSubtotalParent.parentNode.insertBefore(document.createElement("tips-widget"), cartSubtotalParent);


// {% style %}
//   label {
//     border-radius: {{ block.settings.corner_radius }}px; 
//     border-width: {{ block.settings.stroke_width }}px; 
//     border-color: {{ block.settings.stroke_color }}; 
//     background: {{ block.settings.background_color }};
//   }
//   .tips__radio-control {
//     border-width: {{ block.settings.stroke_width }}px; 
//     border-color: {{ block.settings.stroke_color }};
//   }
//   input:checked + label {
//     border-color: {{ block.settings.selection_color }};
//   }
//   input:checked + label > .label-inner > .tips__radio-control {
//     border-color: {{ block.settings.selection_color }};
//     background: {{ block.settings.selection_color }};
//   }
// {% endstyle %}

// {% if cart.item_count > 0 and all_products["fulfillment-tip"].variants[0] and all_products["fulfillment-tip"].variants[1] %}
//   <tips-widget id="tips" data-id="{{ block.id }}">
//     <div class="tips-wrapper">
//       <article>
//         <span class="tips__header">{{ block.settings.label_text }}</span>
//         <span class="tips__subheader no-wrap">
//           Powered by
//           <img src="{{ 'HeyThanks.svg' | asset_url }}" loading="lazy" height="calc(1.8 * 12px)" width="auto" class="logo-img" />
//           <div class="tooltip">
//             <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" height="12" width="12">
//               <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-7.071.929A10 10 0 1117.07 17.07 10 10 0 012.93 2.93z" fill="#5f36d2"/>
//               <path d="M11.126 13.002H8.99V11.86c.01-1.966.492-2.254 1.374-2.782.093-.056.19-.114.293-.178.73-.459 1.292-1.038 1.292-1.883 0-.948-.743-1.564-1.666-1.564-.852 0-1.657.398-1.712 1.533H6.305c.06-2.294 1.877-3.487 3.99-3.487 2.306 0 3.894 1.447 3.894 3.488 0 1.382-.695 2.288-1.806 2.952l-.237.144c-.79.475-1.009.607-1.02 1.777v1.142zm.17 2.012a1.344 1.344 0 01-1.327 1.328 1.32 1.32 0 01-1.227-1.834 1.318 1.318 0 011.227-.81c.712 0 1.322.592 1.328 1.316h-.001z" fill="#5f36d2"/>
//             </svg>
//             <span id="tooltip-text" class="tooltip__text top">{{ block.settings.tooltip_text }}</span>
//           </div>
//         </span>
//       </article>

//       <input type="radio" id="radio-1" name="tip-option">
//       <label for="radio-1" class="animated unselectable">
//         <div class="label-inner">
//           <svg class="tips__radio-check animated" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M1.20005 1.99992L2.86819 3.48173" stroke="white"/>
//             <line x1="2.19643" y1="3.44637" x2="4.89644" y2="0.746374" stroke="white"/>
//           </svg>
//           <span class="tips__radio-control animated"></span>
//           {%- if block.settings.emoji_1 != 'None' -%}
//             <span class="tips__radio-emoji">{{ block.settings.emoji_1 }}</span>
//           {%- endif -%}
//           {%- if all_products["fulfillment-tip"].variants[0] -%}
//             <span class="tips__radio-price">{{ all_products["fulfillment-tip"].variants[0].price | money }}</span>
//           {%- endif -%}
//         </div>
//       </label>

//       <input type="radio" id="radio-2" name="tip-option">
//       <label for="radio-2" class="animated unselectable">
//         <div class="label-inner">
//           <svg class="tips__radio-check animated" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M1.20005 1.99992L2.86819 3.48173" stroke="white"/>
//             <line x1="2.19643" y1="3.44637" x2="4.89644" y2="0.746374" stroke="white"/>
//           </svg>
//           <span class="tips__radio-control animated"></span>
//           {%- if block.settings.emoji_2 != 'None' -%} 
//             <span class="tips__radio-emoji">{{ block.settings.emoji_2 }}</span>
//           {%- endif -%}
//           {%- if all_products["fulfillment-tip"].variants[1] -%}
//             <span class="tips__radio-price">{{ all_products["fulfillment-tip"].variants[1].price | money }}</span>
//           {%- endif -%}
//         </div>
//       </label>
//     </div>
//   </tips-widget>
// {% endif %}

// {% schema %}
//   {
//     "name": "Tips Widget",
//     "target": "section",
//     "stylesheet": "tips-widget.css",
//     "javascript": "tips-widget.js",
//     "templates": ["cart"],
//     "settings": [
//       {
//         "type": "header",
//         "content": "Emoji Options"
//       },
//       {
//         "type": "select",
//         "id": "emoji_1",
//         "label": "Emoji",
//         "options": [
//           {
//             "value": "None",
//             "label": "None"
//           },
//           {
//             "value": "🙂",
//             "label": "🙂"
//           },
//           {
//             "value": "🏎",
//             "label": "🏎"
//           }
//         ],
//         "default": "🙂"
//       },
//       {
//         "type": "select",
//         "id": "emoji_2",
//         "label": "Emoji",
//         "options": [
//           {
//             "value": "None",
//             "label": "None"
//           },
//           {
//             "value": "🥰",
//             "label": "🥰"
//           },
//           {
//             "value": "🚀",
//             "label": "🚀"
//           }
//         ],
//         "default": "🥰"
//       },
//       {
//         "type": "header",
//         "content": "Style Options"
//       },
//       {
//         "type": "color",
//         "id": "background_color",
//         "label": "Background color",
//         "default": "#ffffff"
//       },
//       {
//         "type": "color",
//         "id": "selection_color",
//         "label": "Selection color",
//         "default": "#3678b4"
//       },
//       {
//         "type": "color",
//         "id": "stroke_color",
//         "label": "Stroke color",
//         "default": "#d9d9d9"
//       },
//       {
//         "type": "range",
//         "id": "stroke_width",
//         "min": 1,
//         "max": 5,
//         "step": 1,
//         "unit": "px",
//         "label": "Stroke width",          
//         "default": 2
//       },
//       {
//         "type": "range",
//         "id": "corner_radius",
//         "min": 0,
//         "max": 5,
//         "step": 1,
//         "unit": "px",
//         "label": "Corner radius",          
//         "default": 2
//       },
//       {
//         "type": "header",
//         "content": "Text Options"
//       },
//       {
//         "type": "textarea",
//         "id": "label_text",
//         "label": "Label text",
//         "default": "Send a tip directly to your fulfillment workers 💜"
//       },
//       {
//         "type": "textarea",
//         "id": "tooltip_text",
//         "label": "Tooltip text",
//         "default": "HeyThanks is a service that delivers your tips directly to the fulfillment employees who pick, pack, and ship your order."
//       }
//     ]
//   }
// {% endschema %}