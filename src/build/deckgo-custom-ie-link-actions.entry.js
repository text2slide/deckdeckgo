import { r as registerInstance, n as createEvent, j as h, o as Host } from './index-b2006fe6.js';
import { T as ToolbarActions } from './enums-33af0096.js';
import { D as DeckdeckgoInlineEditorUtils } from './utils-07632afd.js';
import './index-c5d378a5.js';

const linkActionsCss = ":host{width:var(--deckgo-inline-editor-width, 216px);height:44px;line-height:44px;z-index:var(--deckgo-inline-editor-link-zindex, 2)}:host input{pointer-events:visible;background:transparent;width:97%;height:100%;color:var(--deckgo-inline-editor-link-color, black);border:none;outline:0;font-size:16px}:host input::-moz-placeholder{color:var(--deckgo-inline-editor-link-placeholder-color, black)}:host input:-ms-input-placeholder{color:var(--deckgo-inline-editor-link-placeholder-color, black)}:host input::placeholder{color:var(--deckgo-inline-editor-link-placeholder-color, black)}:host(.deckgo-tools-mobile){width:100%}:host(.deckgo-tools-mobile) input{color:var(--deckgo-inline-editor-link-mobile-color, inherit)}:host(.deckgo-tools-mobile) input::-moz-placeholder{color:var(--deckgo-inline-editor-link-mobile-placeholder-color, inherit)}:host(.deckgo-tools-mobile) input:-ms-input-placeholder{color:var(--deckgo-inline-editor-link-mobile-placeholder-color, inherit)}:host(.deckgo-tools-mobile) input::placeholder{color:var(--deckgo-inline-editor-link-mobile-placeholder-color, inherit)}";

let LinkActions = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.linkModified = createEvent(this, "linkModified", 7);
  }
  handleLinkInput($event) {
    this.linkUrl = $event.target.value;
  }
  createLink() {
    return new Promise(async (resolve) => {
      if (!document) {
        resolve();
        return;
      }
      if (!this.anchorLink) {
        resolve();
        return;
      }
      if (!this.linkUrl || this.linkUrl.length <= 0) {
        resolve();
        return;
      }
      let targetContainer = this.anchorLink.range.commonAncestorContainer
        ? this.anchorLink.range.commonAncestorContainer
        : this.selection.anchorNode;
      if (!targetContainer) {
        resolve();
        return;
      }
      // If node text
      if (targetContainer.nodeType === Node.TEXT_NODE ||
        targetContainer.nodeType === Node.COMMENT_NODE) {
        targetContainer = targetContainer.parentElement;
      }
      const target = Array.from(targetContainer.childNodes).find((node) => {
        return (node.textContent &&
          node.textContent.trim().indexOf(this.anchorLink.text) > -1);
      });
      if (!target) {
        resolve();
        return;
      }
      if (target.nodeType === 3) {
        const index = target.textContent.indexOf(this.anchorLink.text);
        const textBefore = index > -1 ? target.textContent.substr(0, index) : null;
        const textAfter = index + this.anchorLink.text.length > -1
          ? target.textContent.substr(index + this.anchorLink.text.length)
          : null;
        if (textBefore) {
          target.parentElement.insertBefore(document.createTextNode(textBefore), target);
        }
        const a = await this.createLinkElement();
        target.parentElement.insertBefore(a, target);
        if (textAfter) {
          target.parentElement.insertBefore(document.createTextNode(textAfter), target);
        }
        target.parentElement.removeChild(target);
      }
      else {
        const a = await this.createLinkElement();
        target.parentElement.replaceChild(a, target);
      }
      const container = await DeckdeckgoInlineEditorUtils.findContainer(this.containers, targetContainer);
      this.linkCreated.emit(container);
      this.toolbarActions = ToolbarActions.SELECTION;
      resolve();
    });
  }
  createLinkElement() {
    return new Promise((resolve) => {
      const a = document.createElement('a');
      const linkText = document.createTextNode(this.anchorLink.text);
      a.appendChild(linkText);
      a.title = this.anchorLink.text;
      a.href = this.linkUrl;
      resolve(a);
    });
  }
  async handleLinkEnter($event) {
    if (!$event) {
      return;
    }
    if (this.toolbarActions === ToolbarActions.SELECTION &&
      ($event.key.toLowerCase() === 'backspace' ||
        $event.key.toLowerCase() === 'delete')) {
      await this.linkModified.emit(false);
    }
    else if (this.toolbarActions === ToolbarActions.LINK &&
      $event.key.toLowerCase() === 'enter') {
      await this.createLink();
      await this.linkModified.emit(true);
    }
  }
  render() {
    const cssClass = this.mobile ? 'deckgo-tools-mobile' : undefined;
    return (h(Host, { class: cssClass }, h("input", { autofocus: true, placeholder: 'Add a link...', onInput: ($event) => this.handleLinkInput($event), onKeyUp: ($event) => this.handleLinkEnter($event) })));
  }
};
LinkActions.style = linkActionsCss;

export { LinkActions as deckgo_custom_ie_link_actions };
