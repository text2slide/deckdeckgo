import { r as registerInstance, j as h, o as Host } from './index-b2006fe6.js';

const separatorCss = "div.separator{display:inline-block;vertical-align:middle;width:1px;min-width:1px;margin:0 6px;height:24px;background:var(--deckgo-inline-editor-separator-background, #f4f5f8)}:host(.deckgo-tools-mobile) div.separator{background:var(--deckgo-ie-separator-mobile-background, #f4f5f8)}";

let Separator = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    const cssClass = this.mobile ? 'deckgo-tools-mobile' : undefined;
    return (h(Host, { class: cssClass }, h("div", { class: 'separator' })));
  }
};
Separator.style = separatorCss;

export { Separator as deckgo_custom_ie_separator };
