function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

class TipsBlock extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {

    on();

    const open = window.XMLHttpRequest.prototype.open;
    document.getElementById('design').style.display = 'none';

    function openReplacement() {
      this.addEventListener("load", async function() {
        const response = await fetch('/cart.js', {
          method: 'GET'
        })
        const cart = await response.json();
        console.log('cart length: ', cart.item_count);
        if (cart.item_count > 0) { 
          document.getElementById('tips').style.display = 'block';
          document.getElementById('design').style.display = 'none';
        }
        else { 
          document.getElementById('tips').style.display = 'none';
          document.getElementById('design').style.display = 'block';
        }
      });
      return open.apply(this, arguments);
    }

    window.XMLHttpRequest.prototype.open = openReplacement;

    document.radioChecked = {};
    document.radioClick = function(e) {
      const obj = e.target, name = obj.name || "unnamed";
      if (e.keyCode) return obj.checked = e.keyCode !== 32;
      obj.checked = document.radioChecked[name] !== obj;
      document.radioChecked[name] = obj.checked ? obj : null;
      console.log(document.radioChecked);
    }
    document.querySelectorAll("input[type='radio']").forEach(radio => {
      radio.setAttribute("onclick", "radioClick(event)");
      radio.setAttribute("onkeyup", "radioClick(event)");
    });
  }

  disconnectedCallback() {
    console.log('Running disconnected callback.')
  }
}

customElements.define('tips-block', TipsBlock)