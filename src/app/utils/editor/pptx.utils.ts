import { lazyLoadSelectedLazyImagesComponent } from '@deckdeckgo/utils';
import { ExportUtils, PPTUtils } from './export.utils';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';

export const exportPPT = () => {
	const body: HTMLBodyElement | null = document.querySelector('body');

	if (!body) {
		return;
	}
	const appRoot: HTMLElement | null = body.querySelector('app-root');

	const onRender = async (
		_mutations: MutationRecord[],
		observer: MutationObserver
	) => {
		observer.disconnect();
		const images: NodeListOf<HTMLDeckgoLazyImgElement> = (
			ExportUtils.cloneEditor as HTMLElement
		).querySelectorAll('deckgo-lazy-img');
		images.forEach(
			(img: HTMLDeckgoLazyImgElement) => (img.customLoader = true)
		);
		await lazyLoadSelectedLazyImagesComponent(Array.from(images));

		appRoot?.classList.add('hidden');
		setTimeout(async () => {
			ExportUtils.initShadowStyle();

			const deckElements = ExportUtils.cloneEditor.querySelectorAll(
				':scope > deckgo-deck'
			);
			setTimeout(async () => {
				const toImages = await Promise.all(
					Array.from(deckElements).map(async (element, index) => {
						return html2canvas(element as HTMLElement, {
							// allowTaint: true,
							useCORS: true,
							// foreignObjectRendering: true,
							width: ExportUtils.pptWidth,
							height: ExportUtils.pptHeight,
						})
							.then(function (canvas) {
								// canvas.style.position = 'absolute';
								// canvas.style.left = '0px';
								// canvas.style.top = '0px';
								// document.body.appendChild(canvas);

								return canvas.toDataURL('image/jpeg', 1.0);
							})
							.catch(function (error) {
								console.error('oops, something went wrong!', error);
							});
					})
				);
				exportPTT_image(toImages);
				// exportPTT_object();
				ExportUtils.removeCloneEditor();
			}, 500);
		}, 500);
	};

	const deckObserver: MutationObserver = new MutationObserver(onRender);
	deckObserver.observe(body, { childList: true, subtree: true });
	ExportUtils.createSlideForExport(true);
};

const exportPTT_image = (images) => {
	const pptx = new pptxgen();
	pptx.defineLayout({
		name: 'pptx_16x9',
		width: ExportUtils.pxToInch(ExportUtils.pptWidth), // unit: inch
		height: ExportUtils.pxToInch(ExportUtils.pptHeight), // unit: inch
	});
	pptx.layout = 'pptx_16x9';

	images.forEach((image: string, index) => {
		const slide = pptx.addSlide(`page${index + 1}`);
		slide.addImage({
			data: image,
			w: '100%',
			h: '100%',
		});
	});

	pptx.writeFile({ fileName: 'Browser-PowerPoint-Demo.pptx' });
};

const exportPTT_object = async () => {
	const x = new PPTUtils();
	await x.export();
};

const testing = () => {
	console.time('exportDeckData');
	const deck: HTMLElement = document.querySelector(
		'app-editor .deck deckgo-deck'
	);
	const deckStyle = window.getComputedStyle(deck);
	const slides = deck.children;
	const data = {
		type: 'deck',
		style: {
			color: deckStyle.color,
			backgroundColor: deckStyle.backgroundColor,
			backgroundImage: deckStyle.backgroundImage,
			lineHeight: deckStyle.lineHeight,
			fontFamily: deckStyle.fontFamily,
		},
		slides: [],
	};

	const slideData = data.slides;
	Array.from(slides).forEach((slide: HTMLElement, slideIndex: number) => {
		if (slide.getAttribute('slot') === 'background') return;

		const slideStyle = window.getComputedStyle(slide);
		const slideRect = slide.getClientRects()[0];

		slideData.push({
			type: 'slide',
			tagName: slide.tagName.toLowerCase(),
			slideIndex: slideIndex,
			rect: {
				width: parseFloat(slideStyle.width),
				height: parseFloat(slideStyle.height),
			},
			style: {
				color: slideStyle.color,
				backgroundColor: slideStyle.backgroundColor,
				lineHeight: slideStyle.lineHeight,
				letterSpacing: slideStyle.letterSpacing,
			},
			elements: [],
		});

		const elements = slide.children;
		const elementData = data.slides[slideIndex].elements;

		Array.from(elements).forEach(
			(element: HTMLElement, elementIndex: number) => {
				const elementStyle = window.getComputedStyle(element);
				const elementRect = element.getClientRects()[0];

				elementData.push({
					type: 'element',
					slideIndex: slideIndex,
					elementIndex: elementIndex,
					tagName: element.tagName.toLowerCase(),
					nodeName: element.nodeName.toLowerCase(),
					rect: {
						width: parseFloat(elementStyle.width),
						height: parseFloat(elementStyle.height),
						rotate: element.style.getPropertyValue('--rotate'),
						x: elementRect.x - slideRect.x,
						y: elementRect.y - slideRect.y,
					},
					style: {
						color: elementStyle.color,
						backgroundColor: elementStyle.backgroundColor,
						lineHeight: elementStyle.lineHeight,
						letterSpacing: elementStyle.letterSpacing,
						fontSize: elementStyle.fontSize,
						fontFamily: elementStyle.fontFamily,
						textAlign: elementStyle.textAlign,
						alignItems: elementStyle.alignItems,
						display: elementStyle.display,
					},
					content: [],
				});

				const contents = element.children;
				const contentData = elementData[elementIndex].content;
				Array.from(contents).forEach(
					(content: HTMLElement, contentIndex: number) => {
						const contentStyle = window.getComputedStyle(content);
						const contentRect = content.getClientRects()[0];
						contentData.push({
							type: 'content',
							slideIndex: slideIndex,
							elementIndex: elementIndex,
							contentIndex: contentIndex,
							tagName: content.tagName.toLowerCase(),
							nodeName: content.nodeName.toLowerCase(),
							rect: {
								width: parseFloat(contentStyle.width),
								height: parseFloat(contentStyle.height),
								rotate: element.style.getPropertyValue('--rotate'),
								x: contentRect.x - elementRect.x,
								y: contentRect.y - elementRect.y,
							},
							style: {
								color: contentStyle.color,
								backgroundColor: contentStyle.backgroundColor,
								lineHeight: contentStyle.lineHeight,
								letterSpacing: contentStyle.letterSpacing,
								fontSize: contentStyle.fontSize,
								fontFamily: contentStyle.fontFamily,
								textAlign: contentStyle.textAlign,
								alignItems: contentStyle.alignItems,
								display: contentStyle.display,
							},
							children: [],
						});

						const children = content.querySelectorAll('*');
						const childrenData = contentData[contentIndex].children;
						children.forEach((child: HTMLElement) => {
							// if()
							// childrenData.push({
							// 	rect: {
							// 		width: parseFloat(contentStyle.width),
							// 		height: parseFloat(contentStyle.height),
							// 		rotate: element.style.getPropertyValue('--rotate'),
							// 		x: contentRect.x - elementRect.x,
							// 		y: contentRect.y - elementRect.y,
							// 	},
							// 	style: {
							// 		color: contentStyle.color,
							// 		backgroundColor: contentStyle.backgroundColor,
							// 		lineHeight: contentStyle.lineHeight,
							// 		letterSpacing: contentStyle.letterSpacing,
							// 		fontSize: contentStyle.fontSize,
							// 		fontFamily: contentStyle.fontFamily,
							// 		textAlign: contentStyle.textAlign,
							// 		alignItems: contentStyle.alignItems,
							// 		display: contentStyle.display,
							// 	},
							// });
						});
					}
				);
			}
		);
	});

	console.timeEnd('exportDeckData');

	const container: HTMLElement = deck.shadowRoot.querySelector('.deckgo-deck');
	const offsetX = parseFloat(container.style.getPropertyValue('--transformX'));
	const currentIndex = Math.abs(offsetX / deck.clientWidth);
	const targetSlide: Element = deck.children[currentIndex];

	Array.from(targetSlide.children).forEach((element) => {
		Array.from(element.children).forEach(function (node) {
			const child = node.firstChild;
			if (child.nodeName === '#text') {
				var range = document.createRange();
				range.selectNodeContents(child);
				var rects = range.getClientRects();
			}

			// const iter = document.createNodeIterator(node, NodeFilter.SHOW_TEXT, {
			// 	acceptNode(iterNode) {
			// 		console.log(iterNode);
			// 		return node.nodeName.toLowerCase() === 'p'
			// 			? NodeFilter.FILTER_ACCEPT
			// 			: NodeFilter.FILTER_REJECT;
			// 	},
			// });
			// var textnode;
			// console.log(node, iter);
			// while ((textnode = iter.nextNode())) {
			// 	// window.getComputedStyle(textnode);
			// 	console.log(
			// 		[textnode]
			// 		// window.getComputedStyle(textnode)
			// 	);
			// }
		});
	});
};
