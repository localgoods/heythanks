let isAboveSubtotal = false;

let hasSeenOverlay = false;

function showOverlay() {
  document.getElementById("overlay").style.animation = "fade-in 1s";
  document.getElementById("recommendation").style.animation = "fade-in 1s";
  document.getElementById("close").style.animation = "fade-in 1s";

  document.getElementById("overlay").style.display = "block";
  document.getElementById("recommendation").style.display = "block";
  document.getElementById("close").style.display = "block";
}

function hideOverlay() {
  document.getElementById("overlay").style.animation = "fade-out 1s";
  document.getElementById("recommendation").style.animation = "fade-out 1s";
  document.getElementById("congratulation").style.animation = "fade-out 1s";
  document.getElementById("close").style.animation = "fade-out 1s";

  document.getElementById("overlay").style.display = "none";
  document.getElementById("recommendation").style.display = "none";
  document.getElementById("congratulation").style.display = "none";
  document.getElementById("close").style.display = "none";
  hasSeenOverlay = true;
}

function setupOverlay() {
  if (!hasSeenOverlay && !isAboveSubtotal) {
    showOverlay();
  }
}

function openUpdateVisibility(open) {
  this.addEventListener("load", async function () {
    const params = { method: "GET" };
    const url = "/cart.js";
    const response = await fetch(url, params);
    const cart = await response.json();
    if (cart.item_count > 0) {
      document.getElementById("tips").style.animation = "fade-in 1s";
      document.getElementById("design").style.animation = "fade-out 1s";

      document.getElementById("tips").style.display = "block";
      document.getElementById("design").style.display = "none";
    } else {
      document.getElementById("tips").style.animation = "fade-out 1s";
      document.getElementById("design").style.animation = "fade-in 1s";

      document.getElementById("tips").style.display = "none";
      document.getElementById("design").style.display = "block";
    }
  });
  return open.apply(this, arguments);
}

function setupVisibility() {
  const open = window.XMLHttpRequest.prototype.open;

  document.getElementById("design").style.animation = "fade-out 1s";
  document.getElementById("congratulation").style.animation = "fade-out 1s";

  document.getElementById("design").style.display = "none";
  document.getElementById("congratulation").style.display = "none";
  window.XMLHttpRequest.prototype.open = () => openUpdateVisibility(open);
}

function setupRadioButtons() {
  document.radioChecked = {};
  document.radioClick = function (e) {
    const obj = e.target,
      name = obj.name || "unnamed";
    if (e.keyCode) return (obj.checked = e.keyCode !== 32);
    obj.checked = document.radioChecked[name] !== obj;
    document.radioChecked[name] = obj.checked ? obj : null;
    console.log(document.radioChecked);
  };
  document.querySelectorAll("input[type='radio']").forEach((radio) => {
    radio.setAttribute("onclick", "radioClick(event)");
    radio.setAttribute("onkeyup", "radioClick(event)");
  });
}

function handleReorder(event) {
  const section = document.getElementById(
    `shopify-section-${event.detail.sectionId}`
  );
  const nextSection = section.nextElementSibling;
  isAboveSubtotal = nextSection.id.includes("cart-footer");
  if (!hasSeenOverlay && isAboveSubtotal) {
    document.getElementById("recommendation").style.animation = "fade-out 1s";
    document.getElementById("congratulation").style.animation = "fade-in 1s";

    document.getElementById("recommendation").style.display = "none";
    document.getElementById("congratulation").style.display = "block";
    setTimeout(() => {
      hideOverlay();
    }, 5000);
  }
}

class TipsBlock extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    document.addEventListener("shopify:section:reorder", handleReorder);

    setupOverlay();

    setupVisibility();

    setupRadioButtons();
  }

  disconnectedCallback() {
    document.removeEventListener("shopify:section:reorder", handleReorder);
  }
}

customElements.define("tips-block", TipsBlock);
