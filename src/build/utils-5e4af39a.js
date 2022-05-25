import { y } from './index-c5d378a5.js';
import { a as ContentList, C as ContentAlign } from './enums-33af0096.js';

class DeckdeckgoInlineEditorUtils {
  static async getBold(element) {
    if (await this.isTag(element, 'b')) {
      return 'bold';
    }
    if (await this.isTag(element, 'strong')) {
      return 'bold';
    }
    return element.style.fontWeight === 'bold'
      ? 'bold'
      : element.style.fontWeight === 'initial'
        ? 'initial'
        : undefined;
  }
  static getFontFamily(element) {
    console.log('getFontFamily', element);
    if (element.style.fontFamily)
      return this.getFontFamilyName(element.style.fontFamily);
    if (!element.hasChildNodes())
      return undefined;
    const children = element.children;
    if (children && children.length > 0) {
      const selectedChild = Array.from(children).find(async (child) => {
        return this.getFontFamilyName(child.style.fontFamily);
      });
      if (selectedChild) {
        return this.getFontFamilyName(selectedChild.style.fontFamily);
      }
    }
    return undefined;
  }
  static getFontFamilyName(font) {
    if (font) {
      const fontFamily = font.split(',')[0];
      return fontFamily.trim();
    }
    return undefined;
  }
  static async getItalic(element) {
    if (await this.isTag(element, 'i')) {
      return 'italic';
    }
    if (await this.isTag(element, 'em')) {
      return 'italic';
    }
    if (element.style.fontStyle === 'italic') {
      return 'italic';
    }
    if (element.style.fontStyle === 'initial') {
      return 'initial';
    }
    if (!element.hasChildNodes()) {
      return undefined;
    }
    const children = element.children;
    if (children && children.length > 0) {
      const selectedChild = Array.from(children).find((child) => {
        return (child.style.fontStyle === 'italic' ||
          child.style.fontStyle === 'initial');
      });
      if (selectedChild) {
        return selectedChild.style.fontStyle === 'italic'
          ? 'italic'
          : 'initial';
      }
    }
    return undefined;
  }
  static async getUnderline(element) {
    if (await this.isTag(element, 'u')) {
      return 'underline';
    }
    if (element.style.textDecoration === 'underline') {
      return 'underline';
    }
    if (element.style.textDecoration === 'initial') {
      return 'initial';
    }
    if (!element.hasChildNodes()) {
      return undefined;
    }
    const children = element.children;
    if (children && children.length > 0) {
      const selectedChild = Array.from(children).find((child) => {
        return (child.style.textDecorationLine === 'underline' ||
          child.style.textDecorationLine === 'initial');
      });
      if (selectedChild) {
        return selectedChild.style.fontStyle === 'underline'
          ? 'underline'
          : 'initial';
      }
    }
    return undefined;
  }
  static async getStrikeThrough(element) {
    if (await this.isTag(element, 'strike')) {
      return 'strikethrough';
    }
    if (element.style.textDecoration === 'line-through') {
      return 'strikethrough';
    }
    if (element.style.textDecoration === 'initial') {
      return 'initial';
    }
    if (!element.hasChildNodes()) {
      return undefined;
    }
    const children = element.children;
    if (children && children.length > 0) {
      const selectedChild = Array.from(children).find((child) => {
        return (child.style.textDecoration === 'line-through' ||
          child.style.textDecoration === 'initial');
      });
      if (selectedChild) {
        return selectedChild.style.fontStyle === 'line-through'
          ? 'strikethrough'
          : 'initial';
      }
    }
    return undefined;
  }
  static async getList(element) {
    if (!element) {
      return undefined;
    }
    if (element.nodeName &&
      element.nodeName.toLowerCase() === 'li' &&
      element.parentElement &&
      element.parentElement.nodeName) {
      return element.parentElement.nodeName.toLowerCase() === 'ol'
        ? ContentList.ORDERED
        : element.parentElement.nodeName.toLowerCase() === 'ul'
          ? ContentList.UNORDERED
          : undefined;
    }
    return undefined;
  }
  static async getContentAlignment(element) {
    const style = window.getComputedStyle(element);
    if (style.textAlign === 'center') {
      return ContentAlign.CENTER;
    }
    else if (style.textAlign === 'right') {
      return ContentAlign.RIGHT;
    }
    else if (style.textAlign === 'left') {
      return ContentAlign.LEFT;
    }
    return y() ? ContentAlign.RIGHT : ContentAlign.LEFT;
  }
  static async isTag(element, tagName) {
    if (!element) {
      return false;
    }
    if (element.nodeName.toLowerCase() === tagName) {
      return true;
    }
    if (element.hasChildNodes()) {
      const children = element.getElementsByTagName(tagName);
      return children && children.length > 0;
    }
    return false;
  }
  static isContainer(containers, element) {
    const containerTypes = containers.toLowerCase().split(',');
    return (element &&
      element.nodeName &&
      containerTypes.indexOf(element.nodeName.toLowerCase()) > -1);
  }
  static isAnchorImage(anchorEvent, imgAnchor) {
    return new Promise((resolve) => {
      if (!anchorEvent) {
        resolve(false);
        return;
      }
      if (!anchorEvent.target || !(anchorEvent.target instanceof HTMLElement)) {
        resolve(false);
        return;
      }
      const target = anchorEvent.target;
      resolve(target.nodeName && target.nodeName.toLowerCase() === imgAnchor);
    });
  }
  static findContainer(containers, element) {
    return new Promise(async (resolve) => {
      if (!element) {
        resolve(null);
        return;
      }
      // Just in case
      if (element.nodeName.toUpperCase() === 'HTML' ||
        element.nodeName.toUpperCase() === 'BODY' ||
        !element.parentElement) {
        resolve(element);
        return;
      }
      if (DeckdeckgoInlineEditorUtils.isContainer(containers, element)) {
        resolve(element);
      }
      else {
        const container = await this.findContainer(containers, element.parentElement);
        resolve(container);
      }
    });
  }
  static async getFontSize(element) {
    if (!element || !element.hasAttribute('size')) {
      return undefined;
    }
    return element.getAttribute('size');
  }
}

export { DeckdeckgoInlineEditorUtils as D };
