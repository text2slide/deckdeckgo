import { r as registerInstance, n as createEvent, j as h, o as Host } from './index-b2006fe6.js';

const actionButtonCss = "button{pointer-events:initial;cursor:pointer;margin:0;height:44px;line-height:44px;z-index:var(--deckgo-inline-editor-button-zindex, 2);display:inline-block;vertical-align:middle;border:0;color:var(--deckgo-inline-editor-button-color, black);transition:0.1s background-color, 0.1s border-color, 0.1s fill;background:transparent;font-size:var(--deckgo-inline-editor-button-font-size, 1.4rem);font-family:var(--deckgo-inline-editor-button-font-family, inherit);-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;outline:0}button.active{color:var(--deckgo-inline-editor-button-color-active, #3880ff)}button[disabled]{color:var(--deckgo-inline-editor-button-color-disabled, #f4f5f8);display:var(--deckgo-inline-editor-button-display-disabled, none)}button.active>div{background-color:var(--deckgo-inline-editor-button-color-active, #3880ff)}button[disabled]>div{background-color:var(--deckgo-inline-editor-button-color-disabled, #f4f5f8)}:host(.deckgo-tools-mobile) button{color:var(--deckgo-inline-editor-button-mobile-color, black);padding:0 4px}:host(.deckgo-tools-mobile) button.active{color:var(--deckgo-inline-editor-button-mobile-color-active, #3880ff)}:host(.deckgo-tools-mobile) button[disabled]{color:var(--deckgo-inline-editor-button-mobile-color-disabled, #f4f5f8)}:host(.deckgo-tools-mobile) button>div{background-color:var(--deckgo-inline-editor-button-mobile-color, black)}:host(.deckgo-tools-mobile) button.active>div{background-color:var(--deckgo-inline-editor-button-mobile-color-active, #3880ff)}:host(.deckgo-tools-mobile) button[disabled]>div{background-color:var(--deckgo-inline-editor-button-mobile-color-disabled, #f4f5f8)}::slotted(*){pointer-events:none}";

let ActionButton = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.action = createEvent(this, "action", 7);
    this.disableAction = false;
  }
  render() {
    const cssClass = this.mobile ? 'deckgo-tools-mobile' : undefined;
    return (h(Host, { class: cssClass }, h("button", { onClick: ($event) => this.action.emit($event), disabled: this.disableAction, class: this.cssClass }, h("slot", null))));
  }
};
ActionButton.style = actionButtonCss;

export { ActionButton as deckgo_custom_ie_action_button };
