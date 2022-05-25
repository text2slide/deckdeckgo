import { r as registerInstance, n as createEvent, j as h, o as Host, m as getElement } from './index-b2006fe6.js';
import { y, x, u, p, w } from './index-c5d378a5.js';
import './index-4e957479.js';
import { T as ToolbarActions, C as ContentAlign, a as ContentList } from './enums-33af0096.js';
import { D as DeckdeckgoInlineEditorUtils } from './utils-07632afd.js';
import { e as execCommand } from './execcommand.utils-c4f7479e.js';
import { D as DEFAULT_PALETTE } from './deckdeckgo-palette-9c409fc8.js';

const deckdeckgoInlineEditorCss = ":host{direction:ltr}div.deckgo-tools{position:var(--deckgo-inline-editor-position, absolute);visibility:hidden;opacity:0;-webkit-animation:0s ease 0s 1 normal none running none;animation:0s ease 0s 1 normal none running none;pointer-events:none;background-image:linear-gradient(to bottom, var(--deckgo-inline-editor-background-top, white), var(--deckgo-inline-editor-background-bottom, white));background-repeat:repeat-x;border:var(--deckgo-inline-editor-border);border-radius:var(--deckgo-inline-editor-border-radius, 8px);padding:var(--deckgo-inline-editor-padding, 0 8px);z-index:var(--deckgo-inline-editor-zindex, 1);display:flex;justify-content:center;align-items:center;width:var(--deckgo-inline-editor-width, inherit);transform:var(--deckgo-inline-editor-transform);box-shadow:var(--deckgo-inline-editor-box-shadow, 0 0 8px 4px rgba(0, 0, 0, 0.1))}div.deckgo-tools.deckgo-tools-sticky,div.deckgo-tools.deckgo-tools-mobile.deckgo-tools-sticky{position:absolute;bottom:var(--deckgo-inline-editor-sticky-bottom, 0);left:0;width:100%;border-radius:0;z-index:var(--deckgo-inline-editor-sticky-zindex);height:var(--deckgo-inline-editor-sticky-height, 56px);padding-left:0}div.deckgo-tools.deckgo-tools-sticky deckgo-ie-action-button,div.deckgo-tools.deckgo-tools-mobile.deckgo-tools-sticky deckgo-ie-action-button{margin:0 2px}div.deckgo-tools.deckgo-tools-sticky deckgo-ie-triangle,div.deckgo-tools.deckgo-tools-mobile.deckgo-tools-sticky deckgo-ie-triangle{display:none}div.deckgo-tools.deckgo-tools-activated{visibility:visible;opacity:1}div.deckgo-tools.deckgo-tools-mobile{box-shadow:var(--deckgo-inline-editor-mobile-box-shadow, 0 0 8px 4px rgba(0, 0, 0, 0.1));background-image:linear-gradient(to bottom, var(--deckgo-inline-editor-mobile-background-top, #fff), var(--deckgo-inline-editor-mobile-background-bottom, #fff));border:var(--deckgo-inline-editor-mobile-border, 0)}:host(.deckgo-tools-ios) div.deckgo-tools.deckgo-tools-mobile.deckgo-tools-sticky{top:calc(var(--deckgo-inline-editor-sticky-scroll, 0));bottom:inherit}";

let DeckdeckgoInlineEditor = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.stickyToolbarActivated = createEvent(this, "stickyToolbarActivated", 7);
    this.imgDidChange = createEvent(this, "imgDidChange", 7);
    this.linkCreated = createEvent(this, "linkCreated", 7);
    this.styleDidChange = createEvent(this, "styleDidChange", 7);
    this.customAction = createEvent(this, "customAction", 7);
    this.palette = DEFAULT_PALETTE;
    this.bold = undefined;
    this.italic = undefined;
    this.underline = undefined;
    this.strikethrough = undefined;
    this.contentList = undefined;
    this.contentFontSize = undefined;
    this.disabledTitle = false;
    this.mobile = false;
    this.stickyDesktop = false;
    this.stickyMobile = false;
    this.toolsActivated = false;
    this.displayToolsActivated = false;
    this.selection = null;
    this.anchorLink = null;
    this.link = false;
    this.toolbarActions = ToolbarActions.SELECTION;
    this.containers = 'h1,h2,h3,h4,h5,h6,div,deckgo-drr,section';
    this.imgAnchor = 'img';
    this.imgPropertyWidth = 'width';
    this.imgPropertyCssFloat = 'float';
    this.imgEditable = false;
    this.list = true;
    this.align = true;
    this.fontSize = true;
    this.backgroundColor = true;
    this.anchorEventLeft = 0;
    this.rtl = y();
    this.startSelection = async ($event) => {
      if (this.displayToolsActivated) {
        return;
      }
      if (this.toolbarActions !== ToolbarActions.IMAGE) {
        this.anchorEvent = $event;
      }
      if (this.toolsActivated) {
        await this.resetImageToolbarActions($event);
        return;
      }
      if (this.toolbarActions === ToolbarActions.IMAGE) {
        this.anchorEvent = $event;
      }
      await this.displayImageActions($event);
    };
    this.resetDisplayToolsActivated();
  }
  resetDisplayToolsActivated() {
    this.debounceDisplayToolsActivated = x(() => {
      this.displayToolsActivated = true;
    });
  }
  async componentWillLoad() {
    await this.attachListener();
    await this.initDefaultContentAlign();
  }
  async componentDidLoad() {
    if (!this.mobile) {
      this.mobile = u();
    }
  }
  async disconnectedCallback() {
    await this.detachListener(this.attachTo ? this.attachTo : document);
  }
  async onAttachTo() {
    if (!this.attachTo) {
      return;
    }
    await this.detachListener(document);
    await this.attachListener();
  }
  attachListener() {
    return new Promise((resolve) => {
      const listenerElement = this.attachTo
        ? this.attachTo
        : document;
      if (listenerElement) {
        listenerElement.addEventListener('mousedown', this.startSelection, {
          passive: true,
        });
        listenerElement.addEventListener('touchstart', this.startSelection, {
          passive: true,
        });
      }
      resolve();
    });
  }
  detachListener(listenerElement) {
    return new Promise((resolve) => {
      if (listenerElement) {
        listenerElement.removeEventListener('mousedown', this.startSelection);
        listenerElement.removeEventListener('touchstart', this.startSelection);
      }
      resolve();
    });
  }
  resetImageToolbarActions($event) {
    return new Promise(async (resolve) => {
      if (this.toolbarActions !== ToolbarActions.IMAGE) {
        resolve();
        return;
      }
      if ($event && $event.target && $event.target instanceof HTMLElement) {
        const target = $event.target;
        if (target &&
          target.nodeName &&
          target.nodeName.toLowerCase() !== 'deckgo-custom-inline-editor') {
          await this.reset(false);
        }
      }
      resolve();
    });
  }
  displayImageActions($event) {
    return new Promise(async (resolve) => {
      if (!this.imgEditable) {
        resolve();
        return;
      }
      const isAnchorImg = await this.isAnchorImage();
      if (!isAnchorImg) {
        resolve();
        return;
      }
      $event.stopImmediatePropagation();
      await this.reset(true);
      setTimeout(async () => {
        await this.activateToolbarImage();
        await this.setToolbarAnchorPosition();
      }, this.mobile ? 300 : 100);
      resolve();
    });
  }
  activateToolbarImage() {
    return new Promise(async (resolve) => {
      this.toolbarActions = ToolbarActions.IMAGE;
      await this.setToolsActivated(true);
      resolve();
    });
  }
  isAnchorImage() {
    return DeckdeckgoInlineEditorUtils.isAnchorImage(this.anchorEvent, this.imgAnchor);
  }
  async selectionchange(_$event) {
    if (document &&
      document.activeElement &&
      !this.isContainer(document.activeElement)) {
      if (document.activeElement.nodeName.toLowerCase() !==
        'deckgo-custom-inline-editor') {
        await this.reset(false);
      }
      return;
    }
    const anchorImage = await this.isAnchorImage();
    if (this.toolbarActions === ToolbarActions.IMAGE && anchorImage) {
      await this.reset(false);
      return;
    }
    await this.displayTools();
  }
  displayTools() {
    return new Promise(async (resolve) => {
      const selection = await this.getSelection();
      if (!this.anchorEvent) {
        await this.reset(false);
        resolve();
        return;
      }
      if (this.attachTo &&
        !this.attachTo.contains(this.anchorEvent.target)) {
        await this.reset(false);
        resolve();
        return;
      }
      if (!selection ||
        !selection.toString() ||
        selection.toString().trim().length <= 0) {
        await this.reset(false);
        resolve();
        return;
      }
      const activated = await this.activateToolbar(selection);
      await this.setToolsActivated(activated);
      if (this.toolsActivated) {
        this.selection = selection;
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          this.anchorLink = {
            range: range,
            text: selection.toString(),
            element: document.activeElement,
          };
          await this.setToolbarAnchorPosition();
        }
      }
      resolve();
    });
  }
  setToolbarAnchorPosition() {
    return new Promise(async (resolve) => {
      if (this.isSticky()) {
        await this.handlePositionIOS();
        resolve();
        return;
      }
      if (this.tools) {
        let top = p(this.anchorEvent).clientY;
        let left = p(this.anchorEvent).clientX - 40;
        if (this.mobile) {
          top = top + 40;
        }
        else {
          top = top + 24;
        }
        const innerWidth = w() ? screen.width : window.innerWidth;
        if (innerWidth > 0 && left > innerWidth - this.tools.offsetWidth) {
          left = innerWidth - this.tools.offsetWidth;
        }
        if (left < 0) {
          left = 0;
        }
        // To set the position of the tools
        this.toolsTop = top;
        this.toolsLeft = left;
        // To set the position of the triangle
        this.anchorEventLeft =
          left > 0
            ? p(this.anchorEvent).clientX - 20 - left
            : p(this.anchorEvent).clientX;
      }
      resolve();
    });
  }
  handlePositionIOS() {
    return new Promise(async (resolve) => {
      if (!w() || !this.anchorEvent) {
        resolve();
        return;
      }
      await this.setStickyPositionIOS();
      if (window) {
        window.addEventListener('scroll', async () => {
          await this.setStickyPositionIOS();
        }, { passive: true });
        window.addEventListener('resize', async () => {
          await this.reset(true, true);
        }, { passive: true });
      }
    });
  }
  setStickyPositionIOS() {
    return new Promise((resolve) => {
      if (!this.stickyMobile || !w() || !window) {
        resolve();
        return;
      }
      if (this.iOSTimerScroll > 0) {
        clearTimeout(this.iOSTimerScroll);
      }
      this.iOSTimerScroll = setTimeout(() => {
        this.el.style.setProperty('--deckgo-inline-editor-sticky-scroll', `${window.scrollY}px`);
      }, 50);
      resolve();
    });
  }
  activateToolbar(selection) {
    return new Promise(async (resolve) => {
      const tools = selection && selection.toString() && selection.toString().length > 0;
      if (tools) {
        const promises = [];
        promises.push(this.initStyle(selection));
        promises.push(this.initLink(selection));
        await Promise.all(promises);
      }
      resolve(tools);
    });
  }
  initStyle(selection) {
    return new Promise(async (resolve) => {
      if (!selection || selection.rangeCount <= 0) {
        resolve();
        return;
      }
      const content = selection.anchorNode;
      if (!content) {
        resolve();
        return;
      }
      if (this.isContainer(content) || content.parentElement) {
        this.bold = undefined;
        this.italic = undefined;
        this.underline = undefined;
        this.strikethrough = undefined;
        this.contentList = undefined;
        this.contentFontSize = undefined;
        await this.initDefaultContentAlign();
        await this.findStyle(this.isContainer(content) ? content : content.parentElement);
      }
      resolve();
    });
  }
  async initDefaultContentAlign() {
    this.contentAlign = this.rtl ? ContentAlign.RIGHT : ContentAlign.LEFT;
  }
  isContainer(element) {
    return DeckdeckgoInlineEditorUtils.isContainer(this.containers, element);
  }
  // TODO: Find a clever way to detect to root container
  // We iterate until we find the root container to detect if bold, underline or italic are active
  findStyle(node) {
    return new Promise(async (resolve) => {
      if (!node) {
        resolve();
        return;
      }
      // Just in case
      if (node.nodeName.toUpperCase() === 'HTML' ||
        node.nodeName.toUpperCase() === 'BODY') {
        resolve();
        return;
      }
      if (this.isContainer(node)) {
        const nodeName = node.nodeName.toUpperCase();
        this.disabledTitle =
          nodeName === 'H1' ||
            nodeName === 'H2' ||
            nodeName === 'H3' ||
            nodeName === 'H4' ||
            nodeName === 'H5' ||
            nodeName === 'H6';
        this.contentAlign =
          await DeckdeckgoInlineEditorUtils.getContentAlignment(node);
        resolve();
      }
      else {
        if (this.bold === undefined) {
          this.bold = await DeckdeckgoInlineEditorUtils.getBold(node);
        }
        if (this.italic === undefined) {
          this.italic = await DeckdeckgoInlineEditorUtils.getItalic(node);
        }
        if (this.underline === undefined) {
          this.underline = await DeckdeckgoInlineEditorUtils.getUnderline(node);
        }
        if (this.strikethrough === undefined) {
          this.strikethrough =
            await DeckdeckgoInlineEditorUtils.getStrikeThrough(node);
        }
        if (this.contentList === undefined) {
          this.contentList = await DeckdeckgoInlineEditorUtils.getList(node);
        }
        await this.findStyle(node.parentNode);
        if (this.contentFontSize === undefined) {
          this.contentFontSize = await DeckdeckgoInlineEditorUtils.getFontSize(node);
        }
        resolve();
      }
    });
  }
  initLink(selection) {
    return new Promise(async (resolve) => {
      if (!selection) {
        resolve();
        return;
      }
      let content = selection.anchorNode;
      if (!content) {
        resolve();
        return;
      }
      if (content.nodeType === 3) {
        content = content.parentElement;
      }
      this.link = content.nodeName && content.nodeName.toLowerCase() === 'a';
      resolve();
    });
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
  clearTheSelection() {
    return new Promise((resolve) => {
      if (window && window.getSelection) {
        if (window.getSelection().empty) {
          window.getSelection().empty();
        }
        else if (window.getSelection().removeAllRanges) {
          window.getSelection().removeAllRanges();
        }
      }
      else if (document && document.selection) {
        document.selection.empty();
      }
      resolve(window.getSelection() || document.getSelection());
    });
  }
  reset(clearSelection, blurActiveElement) {
    return new Promise(async (resolve) => {
      if (clearSelection) {
        await this.clearTheSelection();
      }
      await this.setToolsActivated(false);
      this.resetDisplayToolsActivated();
      this.selection = null;
      this.toolbarActions = ToolbarActions.SELECTION;
      this.anchorLink = null;
      this.link = false;
      if (window) {
        window.removeEventListener('scroll', async () => {
          await this.setStickyPositionIOS();
        });
        window.removeEventListener('resize', async () => {
          await this.reset(true, true);
        });
      }
      if (blurActiveElement &&
        document &&
        document.activeElement &&
        document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      resolve();
    });
  }
  toggleLink() {
    return new Promise(async (resolve) => {
      if (this.link) {
        await this.removeLink();
        await this.reset(true);
      }
      else {
        await this.openLink();
      }
      resolve();
    });
  }
  removeLink() {
    return new Promise((resolve) => {
      if (!this.selection) {
        resolve();
        return;
      }
      let content = this.selection.anchorNode;
      if (!content || !content.parentElement) {
        resolve();
        return;
      }
      if (content.nodeType === 3) {
        content = content.parentElement;
      }
      if (!content.nodeName && content.nodeName.toLowerCase() !== 'a') {
        resolve();
        return;
      }
      content.parentElement.insertBefore(document.createTextNode(content.textContent), content);
      content.parentElement.removeChild(content);
      resolve();
    });
  }
  openLink() {
    return new Promise(async (resolve) => {
      this.toolbarActions = ToolbarActions.LINK;
      resolve();
    });
  }
  isSticky() {
    const mobile = u();
    return (this.stickyDesktop && !mobile) || (this.stickyMobile && mobile);
  }
  setToolsActivated(activated) {
    return new Promise(async (resolve) => {
      this.toolsActivated = activated;
      if (activated) {
        this.debounceDisplayToolsActivated();
      }
      else {
        this.displayToolsActivated = false;
      }
      if (this.isSticky()) {
        this.stickyToolbarActivated.emit(this.toolsActivated);
      }
      resolve();
    });
  }
  async openColorPicker(action) {
    this.toolbarActions = action;
  }
  async openAlignmentActions() {
    this.toolbarActions = ToolbarActions.ALIGNMENT;
  }
  async openFontSizeActions() {
    this.toolbarActions = ToolbarActions.FONT_SIZE;
  }
  async openListActions() {
    this.toolbarActions = ToolbarActions.LIST;
  }
  async onCustomAction($event, action) {
    $event.stopPropagation();
    this.customAction.emit({
      action: action,
      selection: this.selection,
      anchorLink: this.anchorLink,
    });
  }
  async onExecCommand($event) {
    if (!$event || !$event.detail) {
      return;
    }
    await execCommand(this.selection, $event.detail, this.containers);
    const container = await DeckdeckgoInlineEditorUtils.findContainer(this.containers, !this.selection ? document.activeElement : this.selection.anchorNode);
    this.styleDidChange.emit(container);
    await this.reset(true);
  }
  render() {
    let classNames = this.displayToolsActivated
      ? this.mobile
        ? 'deckgo-tools deckgo-tools-activated deckgo-tools-mobile'
        : 'deckgo-tools deckgo-tools-activated'
      : this.mobile
        ? 'deckgo-tools deckgo-tools-mobile'
        : 'deckgo-tools';
    if (this.isSticky()) {
      classNames += ' deckgo-tools-sticky';
    }
    const hostClass = w() ? 'deckgo-tools-ios' : undefined;
    return (h(Host, { class: hostClass }, h("div", { class: classNames, ref: (el) => (this.tools = el), style: { left: `${this.toolsLeft}px`, top: `${this.toolsTop}px` } }, h("deckgo-custom-ie-triangle", { style: {
        '--deckgo-ie-triangle-start': `${this.anchorEventLeft}px`,
      } }), this.renderActions())));
  }
  renderActions() {
    const sticky = this.isSticky();
    if (this.toolbarActions === ToolbarActions.LINK) {
      return (h("deckgo-custom-ie-link-actions", { toolbarActions: this.toolbarActions, anchorLink: this.anchorLink, selection: this.selection, linkCreated: this.linkCreated, containers: this.containers, mobile: this.mobile, onLinkModified: ($event) => this.reset($event.detail) }));
    }
    else if (this.toolbarActions === ToolbarActions.COLOR ||
      this.toolbarActions === ToolbarActions.BACKGROUND_COLOR) {
      return (h("deckgo-custom-ie-color-actions", { selection: this.selection, action: this.toolbarActions === ToolbarActions.BACKGROUND_COLOR
          ? 'background-color'
          : 'color', palette: this.palette, mobile: this.mobile, onExecCommand: ($event) => this.onExecCommand($event) }));
    }
    else if (this.toolbarActions === ToolbarActions.IMAGE) {
      return (h("deckgo-custom-ie-image-actions", { anchorEvent: this.anchorEvent, imgPropertyWidth: this.imgPropertyWidth, imgPropertyCssFloat: this.imgPropertyCssFloat, imgDidChange: this.imgDidChange, containers: this.containers, imgAnchor: this.imgAnchor, mobile: this.mobile, onImgModified: () => this.reset(true) }));
    }
    else if (this.toolbarActions === ToolbarActions.ALIGNMENT) {
      return (h("deckgo-custom-ie-align-actions", { anchorEvent: this.anchorEvent, containers: this.containers, mobile: this.mobile, sticky: sticky, contentAlign: this.contentAlign, onAlignModified: () => this.reset(true) }));
    }
    else if (this.toolbarActions === ToolbarActions.LIST) {
      return (h("deckgo-custom-ie-list-actions", { selection: this.selection, disabledTitle: this.disabledTitle, mobile: this.mobile, sticky: sticky, contentList: this.contentList, onExecCommand: ($event) => this.onExecCommand($event) }));
    }
    else if (this.toolbarActions === ToolbarActions.FONT_SIZE) {
      return (h("deckgo-custom-ie-font-size-actions", { mobile: this.mobile, sticky: sticky, fontSize: this.contentFontSize, onExecCommand: ($event) => this.onExecCommand($event) }));
    }
    else {
      return this.renderSelectionActions();
    }
  }
  renderSelectionActions() {
    return [
      h("deckgo-custom-ie-style-actions", { mobile: this.mobile, disabledTitle: this.disabledTitle, selection: this.selection, bold: this.bold === 'bold', italic: this.italic === 'italic', underline: this.underline === 'underline', strikethrough: this.strikethrough === 'strikethrough', onExecCommand: ($event) => this.onExecCommand($event) }),
      this.renderSeparator(),
      this.renderFontSizeAction(),
      this.renderSeparator(),
      this.renderColorActions(),
      this.renderSeparator(),
      this.renderAlignAction(),
      this.renderListAction(),
      this.renderLinkSeparator(),
      h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: () => this.toggleLink(), cssClass: this.link ? 'active' : undefined }, h("deckgo-custom-ie-action-image", { cssClass: 'link' })),
      this.renderCustomActions(),
    ];
  }
  renderColorActions() {
    const result = [
      h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: () => this.openColorPicker(ToolbarActions.COLOR) }, h("deckgo-custom-ie-action-image", { cssClass: 'pick-color' })),
    ];
    if (this.backgroundColor) {
      result.push(h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: () => this.openColorPicker(ToolbarActions.BACKGROUND_COLOR) }, h("deckgo-custom-ie-action-image", { cssClass: 'pick-background' })));
    }
    return result;
  }
  renderSeparator() {
    return (h("deckgo-custom-ie-separator", { mobile: this.mobile }));
  }
  renderLinkSeparator() {
    if (!this.list && !this.align) {
      return undefined;
    }
    return this.renderSeparator();
  }
  renderCustomActions() {
    return this.customActions
      ? this.customActions
        .split(',')
        .map((customAction) => this.renderCustomAction(customAction))
      : undefined;
  }
  renderCustomAction(customAction) {
    return [
      this.renderSeparator(),
      h("deckgo-custom-ie-action-button", { mobile: this.mobile, onClick: ($event) => this.onCustomAction($event, customAction) }, h("slot", { name: customAction })),
    ];
  }
  renderListAction() {
    if (!this.list) {
      return undefined;
    }
    return (h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: () => this.openListActions() }, h("deckgo-custom-ie-action-image", { cssClass: this.contentList === ContentList.UNORDERED
        ? 'unordered-list'
        : 'ordered-list' })));
  }
  renderAlignAction() {
    if (!this.align) {
      return undefined;
    }
    return (h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: () => this.openAlignmentActions() }, h("deckgo-custom-ie-action-image", { cssClass: this.contentAlign === ContentAlign.LEFT
        ? 'left-align'
        : this.contentAlign === ContentAlign.CENTER
          ? 'center-align'
          : 'right-align' })));
  }
  renderFontSizeAction() {
    if (!this.fontSize) {
      return undefined;
    }
    return (h("deckgo-custom-ie-action-button", { mobile: this.mobile, onAction: () => this.openFontSizeActions() }, h("span", null, "A", h("small", null, "A"))));
  }
  get el() { return getElement(this); }
  static get watchers() { return {
    "attachTo": ["onAttachTo"]
  }; }
};
DeckdeckgoInlineEditor.style = deckdeckgoInlineEditorCss;

export { DeckdeckgoInlineEditor as deckgo_custom_inline_editor };
