import { EventEmitter } from '@stencil/core';

import type { OverlayEventDetail } from '@ionic/core';
import { modalController } from '@ionic/core';

import { deckSelector, StorageFile, UnsplashPhoto } from '@deckdeckgo/editor';

import busyStore from '../../stores/busy.store';

import { ShapeAction, ShapeActionSVG } from '../../types/editor/shape-action';
import { ImageAction } from '../../types/editor/image-action';
import { SlotType } from '../../types/editor/slot-type';
import {
	DeckgoImgAttributes,
	extractAttributes,
} from '../../utils/editor/image.utils';
import { EditAction } from '../../types/editor/edit-action';
import { UserFileModel } from '../../types/core/userData';

import { LineWidthValue } from '../../types/editor/line-width';

export class ShapeHelper {
	constructor(private didChange: EventEmitter<HTMLElement>) {}

	async appendShape(slideElement: HTMLElement, shapeAction: ShapeAction) {
		if (shapeAction.svg) {
			await this.appendShapeSVG(slideElement, shapeAction.svg);
		} else if (shapeAction.img) {
			await this.appendShapeImage(slideElement, shapeAction.img);
		}
	}

	async appendText(slideElement: HTMLElement) {
		await this.appendContentText(slideElement);
	}

	async appendLine(slideElement: HTMLElement, label: string) {
		await this.appendContentLine(slideElement, label);
	}

	private async appendShapeSVG(
		slideElement: HTMLElement,
		shapeAction: ShapeActionSVG
	) {
		busyStore.state.busy = true;

		await this.appendContentShape(
			slideElement,
			shapeAction.ratio,
			shapeAction.src,
			shapeAction.label,
			'svg'
		);
	}

	private async appendShapeImage(
		slideElement: HTMLElement,
		imageAction: ImageAction
	) {
		if (imageAction.action === EditAction.OPEN_UNSPLASH) {
			await this.openModal(slideElement, 'app-unsplash');
		} else if (imageAction.action === EditAction.OPEN_GIFS) {
			await this.openModal(slideElement, 'app-gif');
		} else if (imageAction.action === EditAction.OPEN_CUSTOM) {
			await this.openModal(slideElement, 'app-storage-images');
		} else if (imageAction.action === EditAction.ADD_IMAGE) {
			await this.appendContentShapeImage(
				slideElement,
				imageAction.image as UnsplashPhoto | TenorGif | StorageFile
			);
		}
	}

	async cloneShape(shapeElement: HTMLElement) {
		busyStore.state.busy = true;

		await this.cloneShapeElement(shapeElement);
	}
	/* *NOTE* Image setting */
	private async appendContentShapeImage(
		slideElement: HTMLElement,
		image: UnsplashPhoto | TenorGif | StorageFile
	) {
		const deckgImg: DeckgoImgAttributes | undefined = extractAttributes(image);

		if (deckgImg !== undefined) {
			busyStore.state.busy = true;

			await this.appendContentShape(
				slideElement,
				1,
				deckgImg.src,
				deckgImg.label,
				'img'
			);
		}
	}

	private async openModal(slideElement: HTMLElement, componentTag: string) {
		const modal: HTMLIonModalElement = await modalController.create({
			component: componentTag,
		});

		modal.onDidDismiss().then(async (detail: OverlayEventDetail) => {
			await this.appendContentShapeImage(slideElement, detail.data);
		});

		await modal.present();
	}

	private appendContentShape(
		slideElement: HTMLElement,
		ratio: number,
		src: string,
		label: string,
		type: 'svg' | 'img'
	): Promise<void> {
		return new Promise<void>(async (resolve) => {
			const deckGoDrr: HTMLElement = this.initDeckGoDrrText();

			const size: number = 10; // percent

			if (
				typeof (slideElement as HTMLDeckgoSlideAspectRatioElement)
					.getContainer === 'function'
			) {
				const container: HTMLElement = await (
					slideElement as HTMLDeckgoSlideAspectRatioElement
				).getContainer();
				const height: number =
					(container.offsetWidth * size * ratio) / container.offsetHeight;

				deckGoDrr.style.setProperty('--height', `${height}`);
			} else {
				deckGoDrr.style.setProperty('--height', `${size}`);
			}

			deckGoDrr.style.setProperty('--width', `${size}`);
			deckGoDrr.style.setProperty('--left', `${50 - size / 2}`); // vw center
			deckGoDrr.style.setProperty('--top', `${50 - size / 2}`); // vh center

			this.addShape(deckGoDrr, slideElement, src, label, type);

			resolve();
		});
	}

	private async appendContentText(slideElement: HTMLElement) {
		const deckGoDrr: HTMLElement = this.initDeckGoDrrText();

		deckGoDrr.setAttribute('text', 'true');

		const width: number = 25; // percent
		const height: number = 10; // percent

		deckGoDrr.style.setProperty('--left', `${50 - width / 2}`); // vw center
		deckGoDrr.style.setProperty('--top', `${50 - height / 2}`); // vh center
		deckGoDrr.style.setProperty('--width', `${width}`);
		deckGoDrr.style.setProperty('--height', `${height}`);

		const section = document.createElement(SlotType.SECTION);
		section.setAttribute('contentEditable', 'true');

		this.addSection(deckGoDrr, slideElement, section);
	}

	private async appendContentLine(slideElement: HTMLElement, label: string) {
		const deckGoDrr: HTMLElement = this.initDeckGoDrrText();

		deckGoDrr.setAttribute('resize', 'false');
		deckGoDrr.setAttribute('rotation', 'false');
		deckGoDrr.setAttribute('drag', 'none');
		deckGoDrr.setAttribute('shape', 'true');

		deckGoDrr.style.setProperty('--deckgo-drr-user-select', `none`);
		deckGoDrr.style.setProperty('--deckgo-drr-border', `none`);

		const isElbowLine = label.indexOf('Elbow') > -1;
		const line = document.createElement(
			'deckdeckgo-line' + (isElbowLine ? '-elbow' : '')
		);
		line.setAttribute('line-width', LineWidthValue.VERY_THIN);

		label.toLowerCase().indexOf('arrow') > -1 &&
			line.setAttribute('start-arrow', 'true');

		this.addSection(deckGoDrr, slideElement, line);
	}

	private async cloneShapeElement(shapeElement: HTMLElement) {
		const deckGoDrr: HTMLElement = this.initDeckGoDrrText();

		deckGoDrr.setAttribute('style', shapeElement.getAttribute('style'));

		const newPosition = {
			left: parseFloat(deckGoDrr.style.getPropertyValue('--left')) + 3 + '%',
			top: parseFloat(deckGoDrr.style.getPropertyValue('--top')) + 3.5 + '%',
		};

		deckGoDrr.style.setProperty('--left', newPosition.left);
		deckGoDrr.style.setProperty('--top', newPosition.top);

		const img: HTMLElement = shapeElement.querySelector(SlotType.IMG);

		if (img) {
			const type: 'svg' | 'img' =
				(img as any).imgSrc !== undefined && (img as any).imgSrc !== ''
					? 'img'
					: 'svg';
			const src: string =
				type === 'img' ? (img as any).imgSrc : (img as any).svgSrc;
			const label: string =
				type === 'img' ? (img as any).svgAlt : (img as any).svgAlt;

			this.addShape(deckGoDrr, shapeElement.parentElement, src, label, type);

			return;
		}

		const section: HTMLElement = shapeElement.querySelector(SlotType.SECTION);

		if (section) {
			deckGoDrr.setAttribute('text', 'true');

			this.addSection(
				deckGoDrr,
				shapeElement.parentElement,
				section.cloneNode(true)
			);
		}
	}

	private initDeckGoDrr(): HTMLElement {
		const deckGoDrr: HTMLElement = document.createElement(
			SlotType.DRAG_RESIZE_ROTATE
		);

		deckGoDrr.setAttribute('slot', '');
		deckGoDrr.setAttribute('contentEditable', 'false');

		return deckGoDrr;
	}

	private initDeckGoDrrText(): HTMLElement {
		const deckGoDrr: HTMLElement = document.createElement(
			SlotType.DRAG_RESIZE_ROTATE_TEXT
		);

		deckGoDrr.setAttribute('slot', '');
		deckGoDrr.setAttribute('contentEditable', 'false');

		return deckGoDrr;
	}

	private addShape(
		deckGoDrr: HTMLElement,
		slideElement: HTMLElement,
		src: string,
		label: string,
		type: 'svg' | 'img'
	) {
		const deckgoImg: HTMLDeckgoLazyImgElement = document.createElement(
			SlotType.IMG
		);

		const section: HTMLElement = document.createElement(SlotType.SECTION);
		section.setAttribute('contentEditable', 'true');

		if (type === 'img') {
			deckgoImg.imgSrc = src;
			deckgoImg.customLoader = true;
		} else {
			deckgoImg.svgSrc = src;
		}

		deckgoImg.imgAlt = label;
		deckgoImg.setAttribute('style', '--deckgo-lazy-img-object-fit: contain');

		deckGoDrr.setAttribute('text', 'true');
		deckGoDrr.setAttribute('shape', 'true');
		deckGoDrr.appendChild(deckgoImg);
		deckGoDrr.appendChild(section);

		slideElement.appendChild(deckGoDrr);

		this.didChange.emit(slideElement);
	}

	private addSection(
		deckGoDrr: HTMLElement,
		slideElement: HTMLElement,
		section: HTMLElement | Node
	) {
		deckGoDrr.appendChild(section);

		slideElement.appendChild(deckGoDrr);

		this.didChange.emit(slideElement);
	}
}
