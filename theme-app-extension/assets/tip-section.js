class TipSection extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    console.log('Running connected callback.')
    if(!this.radioChecked) this.radioChecked = {};
    this.querySelectorAll("input[type='radio']").forEach(radio => {
      radio.setAttribute("onclick", this.radioClick);
      radio.setAttribute("onkeyup", this.radioClick);
    });
  }

  disconnectedCallback() {
    console.log('Running disconnected callback.')
  }

  radioClick(event) {
    console.log('Running radio click.')
    const obj = event.target;
    const name = obj.name || "unnamed";
    if(event.keyCode) return obj.checked = event.keyCode!=32;
    obj.checked = this.radioChecked[name] != obj;
    this.radioChecked[name] = obj.checked ? obj : null;
  }
}

customElements.define('tip-section', TipSection)