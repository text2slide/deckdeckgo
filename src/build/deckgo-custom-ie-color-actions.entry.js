import { r as registerInstance, n as createEvent, j as h, o as Host } from './index-b2006fe6.js';
import { P } from './index-c5d378a5.js';

const colorActionsCss = ":host{max-width:var(--deckgo-inline-editor-width, 216px)}:host deckgo-color{pointer-events:all}:host(.deckgo-tools-mobile){max-width:calc(100% - 54px);--deckgo-overflow:scroll;--deckgo-flex-wrap:nowrap}";

let ColorActions = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.execCommand = createEvent(this, "execCommand", 7);
  }
  async selectColor($event) {
    if (!this.selection || !$event || !$event.detail) {
      return;
    }
    if (!this.action) {
      return;
    }
    if (!this.selection || this.selection.rangeCount <= 0 || !document) {
      return;
    }
    const text = this.selection.toString();
    if (!text || text.length <= 0) {
      return;
    }
    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: this.action,
        value: $event.detail.hex,
        initial: (element) => {
          return new Promise(async (resolve) => {
            const rgb = await P($event.detail.hex);
            resolve(element &&
              (element.style[this.action] === $event.detail.hex ||
                element.style[this.action] === `rgb(${rgb})`));
          });
        },
      },
    });
  }
  render() {
    const cssClass = this.mobile ? 'deckgo-tools-mobile' : undefined;
    return (h(Host, { class: cssClass }, h("deckgo-color", { onColorChange: ($event) => this.selectColor($event), palette: this.palette }, h("div", { slot: 'more' }))));
  }
};
ColorActions.style = colorActionsCss;

export { ColorActions as deckgo_custom_ie_color_actions };
