import { r as registerInstance, n as createEvent, j as h, o as Host } from './index-b2006fe6.js';
import { a as ContentList } from './enums-33af0096.js';

const listActionsCss = ":host(.deckgo-tools-sticky) deckgo-ie-action-button{margin:0 2px}deckgo-ie-action-button.active{--deckgo-inline-editor-button-color:var(--deckgo-inline-editor-button-color-active, #3880ff)}";

let AlignActions = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.execCommand = createEvent(this, "execCommand", 7);
    this.disabledTitle = false;
  }
  toggleList(e, type) {
    return new Promise(async (resolve) => {
      e.stopPropagation();
      this.execCommand.emit({
        cmd: 'list',
        detail: {
          type,
        },
      });
      resolve();
    });
  }
  render() {
    return (h(Host, { class: this.sticky ? 'deckgo-tools-sticky' : undefined }, h("deckgo-custom-ie-action-button", { mobile: this.mobile, disableAction: this.disabledTitle, onAction: ($event) => this.toggleList($event.detail, 'ol'), class: this.contentList === ContentList.ORDERED ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { cssClass: 'ordered-list' })), h("deckgo-custom-ie-action-button", { mobile: this.mobile, disableAction: this.disabledTitle, onAction: ($event) => this.toggleList($event.detail, 'ul'), class: this.contentList === ContentList.UNORDERED ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { cssClass: 'unordered-list' }))));
  }
};
AlignActions.style = listActionsCss;

export { AlignActions as deckgo_custom_ie_list_actions };
