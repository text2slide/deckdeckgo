import { r as registerInstance, n as createEvent, j as h, o as Host } from './index-b2006fe6.js';
import { C as ContentAlign } from './enums-33af0096.js';
import { D as DeckdeckgoInlineEditorUtils } from './utils-07632afd.js';
import './index-c5d378a5.js';

const alignActionsCss = ":host(.deckgo-tools-sticky) deckgo-ie-action-button{margin:0 2px}deckgo-ie-action-button.active{--deckgo-inline-editor-button-color:var(--deckgo-inline-editor-button-color-active, #3880ff)}";

let AlignActions = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.alignModified = createEvent(this, "alignModified", 7);
  }
  justifyContent(e, align) {
    return new Promise(async (resolve) => {
      e.stopPropagation();
      const anchorElement = this.anchorEvent.target;
      const container = await DeckdeckgoInlineEditorUtils.findContainer(this.containers, anchorElement);
      container.style.textAlign =
        container.style.textAlign === align ? '' : align;
      await this.alignModified.emit();
      resolve();
    });
  }
  render() {
    return (h(Host, { class: this.sticky ? 'deckgo-tools-sticky' : undefined }, h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.justifyContent($event.detail, ContentAlign.LEFT), class: this.contentAlign === ContentAlign.LEFT ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { cssClass: 'left-align' })), h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.justifyContent($event.detail, ContentAlign.CENTER), class: this.contentAlign === ContentAlign.CENTER ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { cssClass: 'center-align' })), h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.justifyContent($event.detail, ContentAlign.RIGHT), class: this.contentAlign === ContentAlign.RIGHT ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { cssClass: 'right-align' }))));
  }
};
AlignActions.style = alignActionsCss;

export { AlignActions as deckgo_custom_ie_align_actions };
