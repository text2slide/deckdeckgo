import { r as registerInstance, j as h } from './index-b2006fe6.js';

const triangleCss = "div.triangle{z-index:1;position:absolute;top:-34px;left:var(--deckgo-ie-triangle-start, 8px);width:40px;height:40px;overflow:hidden;transform:scale(0.7)}div.triangle:after{content:\"\";position:absolute;width:24px;height:24px;background:white;transform:rotate(45deg);top:28px;left:8px;box-shadow:var(--deckgo-inline-editor-triangle-box-shadow, 0 0 8px 0 rgba(0, 0, 0, 0.1));border:var(--deckgo-inline-editor-border)}";

let Separator = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    if (this.mobile) {
      return undefined;
    }
    return h("div", { class: 'triangle' });
  }
};
Separator.style = triangleCss;

export { Separator as deckgo_custom_ie_triangle };
