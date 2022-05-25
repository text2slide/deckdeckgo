import { r as registerInstance, n as createEvent, j as h, o as Host } from './index-b2006fe6.js';

const styleActionsCss = ":host{display:inline-flex}deckgo-ie-action-button{margin:0 2px}deckgo-ie-action-button.italic span{font-style:italic}deckgo-ie-action-button.underline.active span{border-bottom:1px solid var(--deckgo-inline-editor-button-color-active, #3880ff)}deckgo-ie-action-button.underline span{border-bottom:1px solid var(--deckgo-inline-editor-button-color, black)}:host(.deckgo-tools-mobile) deckgo-ie-action-button.underline.active span{border-bottom:1px solid var(--deckgo-inline-editor-button-mobile-color-active, #3880ff)}:host(.deckgo-tools-mobile) deckgo-ie-action-button.underline span{border-bottom:1px solid var(--deckgo-inline-editor-button-mobile-color, black)}";

let StyleActions = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.execCommand = createEvent(this, "execCommand", 7);
    this.disabledTitle = false;
  }
  async styleBold($event) {
    $event.stopPropagation();
    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'font-weight',
        value: 'bold',
        initial: (element) => Promise.resolve(element && element.style['font-weight'] === 'bold'),
      },
    });
  }
  async styleItalic($event) {
    $event.stopPropagation();
    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'font-style',
        value: 'italic',
        initial: (element) => Promise.resolve(element && element.style['font-style'] === 'italic'),
      },
    });
  }
  async styleUnderline($event) {
    $event.stopPropagation();
    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'text-decoration',
        value: 'underline',
        initial: (element) => Promise.resolve(element && element.style['text-decoration'] === 'underline'),
      },
    });
  }
  async styleStrikeThrough($event) {
    $event.stopPropagation();
    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'text-decoration',
        value: 'line-through',
        initial: (element) => Promise.resolve(element && element.style['text-decoration'] === 'line-through'),
      },
    });
  }
  render() {
    const cssClass = this.mobile ? 'deckgo-tools-mobile' : undefined;
    return (h(Host, { class: cssClass }, h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.styleBold($event.detail), disableAction: this.disabledTitle, cssClass: this.bold ? 'active' : undefined, class: 'bold' }, h("span", null, "B")), h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.styleItalic($event.detail), cssClass: this.italic ? 'active' : undefined, class: 'italic' }, h("span", null, "I")), h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.styleUnderline($event.detail), cssClass: this.underline ? 'active' : undefined, class: this.underline ? 'active underline' : 'underline' }, h("span", null, "U")), h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.styleStrikeThrough($event.detail), cssClass: this.strikethrough ? 'active' : undefined, class: 'strikethrough' }, h("span", { style: { 'text-decoration': 'line-through' } }, "S"))));
  }
};
StyleActions.style = styleActionsCss;

export { StyleActions as deckgo_custom_ie_style_actions };
