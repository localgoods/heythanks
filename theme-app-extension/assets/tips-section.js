class TipsSection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
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

customElements.define('tips-section', TipsSection)