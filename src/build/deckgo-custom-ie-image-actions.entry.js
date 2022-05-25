import { r as registerInstance, n as createEvent, j as h } from './index-b2006fe6.js';
import { I as ImageAlign, b as ImageSize } from './enums-33af0096.js';
import { D as DeckdeckgoInlineEditorUtils } from './utils-07632afd.js';
import './index-c5d378a5.js';

const imageActionsCss = "deckgo-ie-action-button.active{--deckgo-inline-editor-button-color:var(--deckgo-inline-editor-button-color-active, #3880ff)}";

let ImageActions = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.imgModified = createEvent(this, "imgModified", 7);
    this.imgPropertyWidth = 'width';
    this.imgPropertyCssFloat = 'cssFloat';
    this.setImageWith = async (size) => {
      const anchorImg = this.anchorEvent
        .target;
      anchorImg.style.setProperty(this.imgPropertyWidth, size.toString());
    };
    this.setImageAlignment = (align) => {
      const anchorImg = this.anchorEvent
        .target;
      if (align === ImageAlign.START) {
        anchorImg.style.setProperty(this.imgPropertyCssFloat, 'left');
      }
      else {
        anchorImg.style.removeProperty(this.imgPropertyCssFloat);
      }
    };
  }
  componentWillLoad() {
    const target = this.anchorEvent
      .target;
    if (target.style.getPropertyValue(this.imgPropertyWidth) === '25%') {
      this.imageSize = ImageSize.SMALL;
    }
    else if (target.style.getPropertyValue(this.imgPropertyWidth) === '50%') {
      this.imageSize = ImageSize.MEDIUM;
    }
    else if (target.style.getPropertyValue(this.imgPropertyWidth) === '75%') {
      this.imageSize = ImageSize.LARGE;
    }
    else {
      this.imageSize = ImageSize.ORIGINAL;
    }
    if (target.style.getPropertyValue(this.imgPropertyCssFloat) === 'left') {
      this.imageAlign = ImageAlign.START;
    }
    else {
      this.imageAlign = ImageAlign.STANDARD;
    }
  }
  styleImage(e, applyFunction, param) {
    return new Promise(async (resolve) => {
      const isAnchorImg = await this.isAnchorImage();
      if (!isAnchorImg) {
        resolve();
        return;
      }
      e.stopPropagation();
      applyFunction(param);
      const anchorImg = this.anchorEvent
        .target;
      const container = await DeckdeckgoInlineEditorUtils.findContainer(this.containers, anchorImg);
      this.imgDidChange.emit(container);
      this.imgModified.emit();
      resolve();
    });
  }
  deleteImage($event) {
    return new Promise(async (resolve) => {
      const isAnchorImg = await this.isAnchorImage();
      if (!isAnchorImg) {
        resolve();
        return;
      }
      $event.stopPropagation();
      const anchorImg = this.anchorEvent
        .target;
      if (!anchorImg || !anchorImg.parentElement) {
        resolve();
        return;
      }
      const container = await DeckdeckgoInlineEditorUtils.findContainer(this.containers, anchorImg);
      if (!container) {
        resolve();
        return;
      }
      anchorImg.parentElement.removeChild(anchorImg);
      this.imgDidChange.emit(container);
      this.imgModified.emit();
      resolve();
    });
  }
  isAnchorImage() {
    return DeckdeckgoInlineEditorUtils.isAnchorImage(this.anchorEvent, this.imgAnchor);
  }
  render() {
    return [
      h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.styleImage($event.detail, this.setImageWith, ImageSize.ORIGINAL), class: this.imageSize === ImageSize.ORIGINAL ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { class: 'image original' })),
      h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.styleImage($event.detail, this.setImageWith, ImageSize.LARGE), class: this.imageSize === ImageSize.LARGE ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { class: 'image large' })),
      h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.styleImage($event.detail, this.setImageWith, ImageSize.MEDIUM), class: this.imageSize === ImageSize.MEDIUM ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { class: 'image medium' })),
      h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.styleImage($event.detail, this.setImageWith, ImageSize.SMALL), class: this.imageSize === ImageSize.SMALL ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { class: 'image small' })),
      h("deckgo-custom-ie-separator", { mobile: this.mobile }),
      h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.styleImage($event.detail, this.setImageAlignment, ImageAlign.STANDARD), class: this.imageAlign === ImageAlign.STANDARD ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { class: 'image-align standard' })),
      h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.styleImage($event.detail, this.setImageAlignment, ImageAlign.START), class: this.imageAlign === ImageAlign.START ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { class: 'image-align start' }), h("div", null)),
      h("deckgo-custom-ie-separator", { mobile: this.mobile }),
      h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: ($event) => this.deleteImage($event.detail) }, h("deckgo-custom-ie-action-image", { class: 'image-delete' })),
    ];
  }
};
ImageActions.style = imageActionsCss;

export { ImageActions as deckgo_custom_ie_image_actions };
