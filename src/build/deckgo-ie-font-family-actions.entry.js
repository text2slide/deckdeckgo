import { r as registerInstance, n as createEvent, j as h, o as Host, F as Fragment } from './index-b2006fe6.js';
import { F as FontsService } from './fonts.service-3e471a47.js';
import { D as DeckdeckgoInlineEditorUtils } from './utils-07632afd.js';
import './assets.store-a7628f5a.js';
import './index-74a8356e.js';
import './index-3ed890df.js';
import './environment-config.service-1b754236.js';
import './index-c5d378a5.js';
import './enums-33af0096.js';

const fontFamilyActionsCss = ":host .deckgo-font-family-container{position:absolute;display:flex;left:60%;top:calc(100% + 4px);maxwidth:fit-content;background-color:white;border-radius:10px;box-shadow:0px 0px 3px 3px rgba(0, 0, 0, 0.07);width:110%;flex-wrap:wrap;visibility:hidden;opacity:0}:host .deckgo-font-family-container.deckgo-tools-activated{visibility:visible;opacity:1}:host .deckgo-font-family-container deckgo-ie-action-button span{font-size:13px;display:flex;min-width:-webkit-max-content;min-width:-moz-max-content;min-width:max-content;word-break:break-word;padding:0px 5px}:host .deckgo-font-family-container deckgo-ie-action-button.active span{color:#3880ff}";

let FontFamilyActions = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.execCommand = createEvent(this, "execCommand", 7);
    this.selection = null;
    this.displayToolsActived = false;
    this.anchorEventLeft = 0;
    this.fontsService = FontsService.getInstance();
  }
  async componentWillLoad() {
    this.fonts = await this.fontsService.loadAllGoogleFonts();
  }
  async selectionchange(_$event) {
    if (this.displayToolsActived) {
      this.displayToolsActived = false;
    }
    const selection = await this.getSelection();
    this.selection = selection;
    await this.initStyle(selection);
  }
  async initStyle(selection) {
    if (selection) {
      const content = selection.anchorNode;
      content && (await this.findStyle(content.parentElement));
    }
  }
  getSelection() {
    return new Promise((resolve) => {
      let selectedSelection = null;
      if (window && window.getSelection) {
        selectedSelection = window.getSelection();
      }
      else if (document && document.getSelection) {
        selectedSelection = document.getSelection();
      }
      else if (document && document.selection) {
        selectedSelection = document.selection.createRange().text;
      }
      resolve(selectedSelection);
    });
  }
  findStyle(node) {
    return new Promise(async (resolve) => {
      if (!node) {
        resolve();
        return;
      }
      if (node.nodeName.toUpperCase() === 'HTML' ||
        node.nodeName.toUpperCase() === 'BODY') {
        resolve();
        return;
      }
      if (this.fontFamily === undefined) {
        this.fontFamily = DeckdeckgoInlineEditorUtils.getFontFamily(node);
      }
      // await this.findStyle(node.parentNode);
      resolve();
    });
  }
  async toggleFontChoose() {
    if (!this.displayToolsActived) {
      await this.initStyle(this.selection);
    }
    this.displayToolsActived = !this.displayToolsActived;
  }
  async modifyFontFamily($event, font) {
    $event.stopPropagation();
    await this.toggleFontChoose();
    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'font-family',
        value: font.family,
        initial: (element) => Promise.resolve(element && element.style['font-family'] === font.family),
      },
    });
  }
  render() {
    const classNames = this.displayToolsActived
      ? 'deckgo-font-family-container deckgo-tools-activated'
      : 'deckgo-font-family-container';
    return (h(Host, null, h("deckgo-ie-action-button", { slot: 'font-choose', style: { display: 'flex', marginTop: '-1px' }, onAction: async (_$event) => await this.toggleFontChoose() }, h("span", { style: { fontFamily: 'serif' } }, "T")), this.displayToolsActived && (h(Fragment, null, h("deckgo-ie-triangle", { style: {
        '--deckgo-ie-triangle-start': `${this.anchorEventLeft}px`,
      } }), h("div", { class: classNames, ref: (el) => (this.tools = el) }, this.fonts.map((font) => this.renderAction(font)))))));
  }
  renderAction(font) {
    return (h("deckgo-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.modifyFontFamily($event.detail, font), class: this.fontFamily?.includes(font.name) ? 'active' : undefined }, h("span", { class: 'deckgo-font-family-option', style: {
        fontFamily: font.family,
      } }, font.name)));
  }
};
FontFamilyActions.style = fontFamilyActionsCss;

export { FontFamilyActions as deckgo_ie_font_family_actions };
