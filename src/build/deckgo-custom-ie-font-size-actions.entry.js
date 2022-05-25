import { r as registerInstance, n as createEvent, j as h, o as Host } from './index-b2006fe6.js';
import { F as FontSize } from './enums-33af0096.js';

const fontSizeActionsCss = ":host(.deckgo-tools-sticky) deckgo-ie-action-button{margin:0 2px}deckgo-ie-action-button.active{--deckgo-inline-editor-button-color:var(--deckgo-inline-editor-button-color-active, #3880ff)}deckgo-ie-action-button:first-of-type{--deckgo-inline-editor-button-font-size:0.8rem}deckgo-ie-action-button:nth-of-type(2){--deckgo-inline-editor-button-font-size:1rem}deckgo-ie-action-button:nth-of-type(3){--deckgo-inline-editor-button-font-size:1.2rem}deckgo-ie-action-button:nth-of-type(5){--deckgo-inline-editor-button-font-size:1.6rem}deckgo-ie-action-button:nth-of-type(6){--deckgo-inline-editor-button-font-size:1.8rem}deckgo-ie-action-button:nth-of-type(7){--deckgo-inline-editor-button-font-size:2rem}";

let FontSizeActions = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.execCommand = createEvent(this, "execCommand", 7);
  }
  async modifyFontSize($event, size) {
    $event.stopPropagation();
    const value = Object.keys(FontSize).find((key) => FontSize[key] === size);
    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'font-size',
        value: value.toLowerCase().replace('_', '-'),
        initial: (element) => Promise.resolve(element &&
          element.style['font-size'] ===
            value.toLowerCase().replace('_', '-')),
      },
    });
  }
  render() {
    return (h(Host, { class: this.sticky ? 'deckgo-tools-sticky' : undefined }, this.renderAction(FontSize.X_SMALL), this.renderAction(FontSize.SMALL), this.renderAction(FontSize.MEDIUM), this.renderAction(FontSize.LARGE), this.renderAction(FontSize.X_LARGE), this.renderAction(FontSize.XX_LARGE), this.renderAction(FontSize.XXX_LARGE)));
  }
  renderAction(size) {
    return (h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.modifyFontSize($event.detail, size), class: this.fontSize === size ? 'active' : undefined }, h("span", null, size.toString())));
  }
};
FontSizeActions.style = fontSizeActionsCss;

export { FontSizeActions as deckgo_custom_ie_font_size_actions };
