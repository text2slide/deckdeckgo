import pptxgen from 'pptxgenjs';
import { ColorUtils } from './color.utils';

export class ExportUtils {
	constructor() {}

	static get pptWidth() {
		return 720;
	}

	static get pptHeight() {
		return 405;
	}

	static pxToInch(px: number) {
		return px * (1 / 96);
	}

	private static get deckElement(): HTMLElement | null {
		return document?.querySelector('app-root app-editor main deckgo-deck');
	}

	static get cloneEditor(): HTMLElement | null {
		return document?.querySelector('.cloneForExport');
	}

	static async createSlideForExport(exportForPPT?: boolean) {
		// remove cloned deck
		this.removeCloneEditor();

		const deckEditor: HTMLElement = document.createElement('app-deck-editor');
		const cloneDeck: Node = this.deckElement.cloneNode(true);
		deckEditor.id = exportForPPT ? 'ppt' : 'print';
		// deckEditor.style.visibility = exportForPPT ? 'visible' : 'hidden';
		deckEditor.classList.add('cloneForExport');

		deckEditor.appendChild(cloneDeck);
		this.initSlideForExport(deckEditor);

		document.body.appendChild(deckEditor);
	}

	static removeCloneEditor() {
		if (!this.cloneEditor) return;

		while (this.cloneEditor) {
			document.body.removeChild(this.cloneEditor);
		}
	}

	private static initSlideForExport(deckEditor) {
		this.changeDeckStructure(deckEditor);
		this.scaleDeck(deckEditor);
	}

	private static changeDeckStructure(cloneEditor) {
		const deckElement: HTMLElement = cloneEditor.querySelector('deckgo-deck');

		let slideElement: HTMLElement | null =
			cloneEditor.querySelector('deckgo-deck > *');

		deckElement.setAttribute('direction', 'vertical');

		// one deck wrap one slide
		while (slideElement) {
			if (!slideElement.getAttribute('slot')) {
				const cloneDeck: HTMLElement = deckElement.cloneNode(
					true
				) as HTMLElement;
				const cloneSlide: HTMLElement = slideElement.cloneNode(
					true
				) as HTMLElement;

				// clear all element in deckgo-deck
				while (cloneDeck.firstChild) {
					cloneDeck.firstChild.remove();
				}

				cloneDeck.appendChild(cloneSlide);

				cloneEditor.appendChild(cloneDeck);
			}

			slideElement = slideElement.nextElementSibling as HTMLElement;
		}

		cloneEditor.removeChild(deckElement);
	}

	private static scaleDeck(cloneEditor) {
		const exportForPPT: boolean = cloneEditor.id === 'ppt';
		let cloneDeck: HTMLElement | null =
			cloneEditor.querySelector('deckgo-deck');

		const deck: HTMLElement = document.querySelector(
			'app-editor main deckgo-deck'
		);
		const originWidth = exportForPPT ? this.pptWidth : deck.offsetWidth;
		const originHeight = exportForPPT ? this.pptHeight : deck.offsetHeight;
		const scale = exportForPPT
			? 1
			: Math.max(1, (297 * 3.7795275591) / originWidth);

		while (cloneDeck) {
			if (cloneDeck.tagName.toLowerCase() === 'deckgo-deck') {
				const cloneSlide: HTMLElement =
					cloneDeck.firstElementChild as HTMLElement;
				cloneDeck.setAttribute('direction', 'vertical');

				cloneSlide.style.transform = `scale(${scale})`;
				cloneSlide.style.transformOrigin = `left top`;

				// init size as same as actual slide element
				cloneSlide.style.setProperty('--slide-width', `${originWidth}px`);
				cloneSlide.style.setProperty('--slide-height', `${originHeight}px`);
			}
			cloneDeck = cloneDeck.nextElementSibling as HTMLElement;
		}
	}

	static initShadowStyle() {
		this.setShadowFont();
		this.setOtherShadowStyle();
	}

	private static setShadowFont() {
		const deckElement = this.deckElement;
		const deckShadow: HTMLElement =
			deckElement.shadowRoot.querySelector('.deckgo-deck');

		const cloneEditor = this.cloneEditor;
		const exportForPPT: boolean = cloneEditor.id === 'ppt';
		let cloneDeck: HTMLElement | null =
			cloneEditor.querySelector('deckgo-deck');

		const cssStyle = {};
		const cssProperty = [
			'--slide-font-size',
			'--slide-auto-font-size',
			'--slide-auto-ratio-font-size',
		];
		// get and record all font-size property value in cssStyle
		cssProperty.forEach((cssPropertyName) => {
			cssStyle[cssPropertyName] = exportForPPT
				? this.getFontSize(cssPropertyName)
				: getComputedStyle(deckShadow).getPropertyValue(cssPropertyName);
		});

		// replace shadowDOM css font-size property by actual deck style property
		while (cloneDeck) {
			if (cloneDeck.tagName.toLowerCase() === 'deckgo-deck') {
				let cloneDeckShadow: HTMLElement =
					cloneDeck.shadowRoot.querySelector('.deckgo-deck');

				if (cloneDeckShadow) {
					Object.entries(cssStyle).forEach(
						([cssPropertyName, value]: [string, string]) => {
							cloneDeckShadow.style.setProperty(cssPropertyName, value);
						}
					);
				}
			}
			cloneDeck = cloneDeck.nextElementSibling as HTMLElement;
		}
	}

	private static getFontSize(
		propertyName: string,
		parentSize: { width: number; height: number } = {
			width: this.pptWidth,
			height: this.pptHeight,
		}
	) {
		switch (propertyName) {
			case '--slide-font-size':
				return '';

			case '--slide-auto-font-size':
				return `${parentSize.height / 576}em`;

			case '--slide-auto-ratio-font-size':
				return `${((parentSize.width / 16) * 9) / 576}em`;
		}
	}

	private static setOtherShadowStyle() {
		const deckElement = this.deckElement;
		const cloneEditor = this.cloneEditor;
		let cloneDeck: HTMLElement | null =
			cloneEditor.querySelector(`deckgo-deck`);
		const exportForPPT: boolean = cloneEditor.id === 'ppt';

		const originWidth = exportForPPT ? this.pptWidth : deckElement.offsetWidth;
		const originHeight = exportForPPT
			? this.pptHeight
			: deckElement.offsetHeight;

		const size: {
			width: number;
			height: number;
		} = {
			width: originWidth,
			height: originHeight,
		};

		while (cloneDeck) {
			const margin = exportForPPT
				? 0
				: Math.floor(((210 / 297) * size.width - size.height) / 2);
			if (cloneDeck.tagName.toLowerCase() === 'deckgo-deck') {
				const cloneSlide: HTMLElement =
					cloneDeck.firstElementChild as HTMLElement;
				const cloneShadow: HTMLElement =
					cloneSlide.shadowRoot.querySelector('.deckgo-slide');

				if (cloneShadow) {
					const padding: {
						top: string;
						bottom: string;
						left: string;
						right: string;
					} = {
						top: exportForPPT
							? '32px'
							: getComputedStyle(cloneShadow).getPropertyValue(
									'--slide-padding-top-default'
							  ),
						bottom: exportForPPT
							? '32px'
							: getComputedStyle(cloneShadow).getPropertyValue(
									'--slide-padding-bottom-default'
							  ),
						left: exportForPPT
							? '32px'
							: getComputedStyle(cloneShadow).getPropertyValue(
									'--slide-padding-start-default'
							  ),
						right: exportForPPT
							? '32px'
							: getComputedStyle(cloneShadow).getPropertyValue(
									'--slide-padding-end-default'
							  ),
					};

					cloneShadow.style.height = `calc(${size.height}px - ${padding.top} - ${padding.bottom})`;
					cloneShadow.style.maxHeight = `${size.height}px`;
					cloneShadow.style.minHeight = 'unset';

					cloneShadow.style.width = `calc(${size.width}px - ${padding.left} - ${padding.right})`;
					cloneShadow.style.maxWidth = `${size.width}px`;

					cloneShadow.style.padding = `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`;
					cloneShadow.style.margin = `${margin}px 0px`;

					cloneShadow.style.setProperty(
						'--slide-padding-top-default',
						padding.top
					);
					cloneShadow.style.setProperty(
						'--slide-padding-bottom-default',
						padding.bottom
					);
					cloneShadow.style.setProperty(
						'--slide-padding-start-default',
						padding.left
					);
					cloneShadow.style.setProperty(
						'--slide-padding-end-default',
						padding.right
					);

					switch (cloneSlide.tagName.toLowerCase()) {
						case 'deckgo-slide-chart-custom':
							this.amendSlideChart(cloneSlide, cloneShadow);
							break;
						case 'deckgo-slide-youtube':
							const cloneYoutube: HTMLElement = cloneShadow.querySelector(
								'.deckgo-youtube-container'
							);
							cloneYoutube.style.width = `calc(var(--slide-width) - var(--slide-padding-end, 32px) - var(--slide-padding-start, 32px))`;
							(cloneSlide as HTMLDeckgoSlideYoutubeElement).resizeContent();
					}
				}
			}

			cloneDeck = cloneDeck.nextElementSibling as HTMLElement;
		}
	}

	private static amendSlideChart(
		cloneSlide: HTMLElement,
		cloneShadow: HTMLElement
	) {
		const exportForPPT: boolean = this.cloneEditor.id === 'ppt';
		const container: HTMLElement = cloneShadow.querySelector(
			'.deckgo-chart-container'
		);
		const cloneChart = container.firstElementChild as HTMLElement;
		cloneChart.setAttribute('custom-loader', 'true');

		(cloneSlide as HTMLDeckgoSlideChartCustomElement)
			.lazyLoadContent()
			.then(() => {
				if (!exportForPPT) return;

				const svg = cloneChart.shadowRoot.querySelector('svg');
				const DOMRect = container.getBoundingClientRect();

				setTimeout(() => {
					const g = svg.querySelector('g');
					const DOMRect_svg = svg.getBoundingClientRect();
					const diffWidth = DOMRect.width - DOMRect_svg.width;
					const diffHeight = DOMRect.height - DOMRect_svg.height;

					svg.style.width = `${DOMRect.width}px`;
					svg.style.height = `${DOMRect.height}px`;
					if (cloneChart.tagName.toLowerCase() !== 'deckgo-custom-pie-chart') {
						g.setAttribute(
							'transform',
							`translate(${diffWidth / 2 + 32},${diffHeight / 2})`
						);

						cloneChart.style.left = `${(DOMRect.width + diffWidth - 32) / 2}px`;
						cloneChart.style.top = `${(DOMRect.height + diffHeight) / 2}px`;
					} else {
						g.setAttribute(
							'transform',
							`translate(${DOMRect.width / 2},${DOMRect.height / 2})`
						);

						cloneChart.style.left = `${DOMRect.width / 2}px`;
						cloneChart.style.top = `${DOMRect.height / 2}px`;
					}
				}, 100);
			});
	}
}

export class PPTUtils {
	private pptx: pptxgen = new pptxgen();

	private cloneEditor: HTMLElement = ExportUtils.cloneEditor;
	private cloneDecks = this.cloneEditor.querySelectorAll(
		':scope > deckgo-deck'
	);

	public async export() {
		console.time('pptExport');
		this.initLayout();
		await this.initSlide();

		// this.pptx.writeFile({ fileName: 'Browser-PowerPoint-Demo.pptx' });
		console.timeEnd('pptExport');
	}

	private pxToInch(px: number) {
		return px * (1 / 96);
	}

	private imgToBase64(img: HTMLImageElement): string {
		let canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;
		ctx.drawImage(img as CanvasImageSource, 0, 0);
		const base64 = canvas.toDataURL();
		canvas = null;

		return base64;
	}

	private svgToBase64(svg: SVGSVGElement): string {
		const s = new XMLSerializer().serializeToString(svg);
		const encodedData = window.btoa(s);
		return 'data:image/svg+xml;base64,' + encodedData;
	}

	private initLayout() {
		this.pptx.defineLayout({
			name: 'pptx_16x9',
			width: this.pxToInch(ExportUtils.pptWidth), // unit: inch
			height: this.pxToInch(ExportUtils.pptHeight), // unit: inch
		});
		this.pptx.layout = 'pptx_16x9';
	}

	private async initSlide() {
		Array.from(this.cloneDecks).forEach(async (cloneDeck, index) => {
			const cloneSlide = cloneDeck.firstElementChild;
			const slideStyle = window.getComputedStyle(cloneSlide);
			const bgColor = await ColorUtils.rgbaToColorData(
				slideStyle.backgroundColor
			);
			const color = await ColorUtils.rgbaToColorData(slideStyle.color);
			const bgImage: Element = cloneSlide.querySelector(
				'[slot="background"]'
			).firstElementChild;

			this.pptx.defineSlideMaster({
				title: `Slide`,
				margin: this.pxToInch(32),
			});
			const pptxSlide = this.pptx.addSlide('Slide');

			pptxSlide.color = color.hex;
			pptxSlide.background = {
				color: bgColor.hex,
				transparency: 100 - bgColor.opacity,
			};

			if (cloneSlide.querySelector('[slot="background"]')) {
				if (bgImage.tagName.toLowerCase() === 'deckgo-lazy-img') {
					this.addImageElement(
						pptxSlide,
						bgImage.shadowRoot.querySelector('img')
					);
				} else if (bgImage.tagName.toLowerCase() === 'svg') {
					this.addImageElement(
						pptxSlide,
						cloneSlide.querySelector('[slot="background"] svg')
					);
				}
			}

			this.initSlideObject(pptxSlide, cloneSlide);
		});
	}

	private updateSvgStyle(svg: SVGSVGElement) {
		const otherElments = svg.querySelectorAll(':scope *');
		Array.from(otherElments).forEach((otherElement: HTMLElement) => {
			const style = window.getComputedStyle(otherElement);
			otherElement.style.fill =
				style.fill === 'rgba(0, 0, 0, 0)' ? 'none' : style.fill;
			otherElement.style.stroke = style.stroke;
			otherElement.style.strokeWidth = style.strokeWidth;
		});
	}

	private initSlideObject(pptxSlide, cloneSlide) {
		const cloneElements = cloneSlide.querySelectorAll(
			':scope > *:not([slot="background"])'
		);

		Array.from(cloneElements).forEach(
			async (cloneElement: HTMLElement, index) => {
				switch (cloneElement.tagName.toLowerCase()) {
					case 'deckgo-drr':
					case 'deckgo-drr-text':
						this.convertDeckgoDrr(pptxSlide, cloneElement);
						break;
				}
			}
		);

		this.addShadowElement(pptxSlide, cloneSlide);
	}

	private convertDeckgoDrr(pptxSlide, deckgoDrr: HTMLElement) {
		const elements = deckgoDrr.children;
		const rotate = deckgoDrr.style.getPropertyValue('--rotate');

		Array.from(elements).forEach((element, index) => {
			this.convertDeckgoDrrElement(pptxSlide, element, rotate);
		});
	}

	private convertDeckgoDrrElement(pptxSlide, element: Element, rotate) {
		switch (element.tagName.toLowerCase()) {
			case 'deckgo-lazy-img':
				this.addImageElement(
					pptxSlide,
					element.getAttribute('svg-src')
						? element.shadowRoot.querySelector('svg')
						: element.getAttribute('img-src')
						? element.shadowRoot.querySelector('img')
						: null,
					rotate
				);
				break;
			case 'deckdeckgo-line':
			case 'deckdeckgo-line-elbow':
				this.addImageElement(
					pptxSlide,
					element.shadowRoot.querySelector(':scope svg'),
					rotate
				);
				break;
			default:
				this.addTextElement(pptxSlide, element);
		}
	}

	private addImageElement(
		pptxSlide,
		element: SVGSVGElement | HTMLImageElement,
		rotate: string = '0deg',
		setting: {
			x?: number;
			y?: number;
			w?: number | string;
			h?: number | string;
		} = {}
	) {
		if (!element) return;

		const type = element instanceof HTMLImageElement ? 'img' : 'svg';
		// element.style.transform = `rotate(-${rotate || '0deg'})`;

		const DOMRect = element.getBoundingClientRect();
		var width = DOMRect.width;
		var height = DOMRect.height;

		if (type === 'img') {
			var base64 = this.imgToBase64(element as HTMLImageElement);
		} else {
			this.updateSvgStyle(element as SVGSVGElement);
			var base64 = this.svgToBase64(element as SVGSVGElement);
		}
		pptxSlide.addImage({
			data: base64,
			x: setting.x !== undefined ? setting.x : this.pxToInch(DOMRect.x),
			y: setting.y !== undefined ? setting.y : this.pxToInch(DOMRect.y),
			w: setting.w !== undefined ? setting.w : this.pxToInch(width),
			h: setting.h !== undefined ? setting.h : this.pxToInch(height),
			rotate: (parseFloat(rotate) || 0).toFixed(0),
		});
	}

	private addTextElement(pptxSlide, element: Element) {
		const DOMRect = element.getBoundingClientRect();
		const cssStyle = window.getComputedStyle(element);
		const defaultSet = {
			x: this.pxToInch(DOMRect.x),
			y: this.pxToInch(DOMRect.y),
			w: this.pxToInch(DOMRect.width),
			h: this.pxToInch(DOMRect.height),
			align: cssStyle.textAlign,
		};
	}

	private addShadowElement(pptxSlide, cloneSlide) {
		switch (cloneSlide.tagName.toLowerCase()) {
			case 'deckgo-slide-youtube':
				const deckgoYoutube: HTMLElement =
					cloneSlide.shadowRoot.querySelector('deckgo-youtube');
				const iframe: HTMLElement =
					deckgoYoutube.shadowRoot.querySelector('iframe');
				const src = iframe.getAttribute('src');
				var DOMRect = iframe.getBoundingClientRect();
				pptxSlide.addMedia({
					type: 'online',
					link: src,
					x: this.pxToInch(DOMRect.x),
					y: this.pxToInch(DOMRect.y),
					w: this.pxToInch(DOMRect.width),
					h: this.pxToInch(DOMRect.height),
				});

				break;
			case 'deckgo-slide-chart-custom':
				const cloneChart: HTMLElement = cloneSlide.shadowRoot.querySelector(
					'.deckgo-chart-container'
				);
				const svg: SVGSVGElement =
					cloneChart.firstElementChild.shadowRoot.querySelector(':scope svg');
				const g = svg.querySelector('g');

				var DOMRect = cloneChart.getBoundingClientRect();
				var DOMRect_svg = svg.getBoundingClientRect();

				const offsetX = (DOMRect.width - DOMRect_svg.width) / 2;
				const offsetY = (DOMRect.height - DOMRect_svg.height) / 2;
				g.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

				svg.style.width = `${DOMRect.width}px`;
				svg.style.height = `${DOMRect.height}px`;
				this.addImageElement(pptxSlide, svg, '', {
					x: this.pxToInch(DOMRect.x),
					y: this.pxToInch(DOMRect.y),
					w: this.pxToInch(DOMRect.width),
					h: this.pxToInch(DOMRect.height),
				});
				break;
		}
	}
}
