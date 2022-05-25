import { isRTL } from '@deckdeckgo/utils';
import { SlotType } from '../../types/editor/slot-type';

export enum TextAlign {
	LEFT = 'left',
	CENTER = 'center',
	RIGHT = 'right',
}

export enum VerticalTextAlign {
	TOP = 'flex-start',
	MIDDLE = 'center',
	BOTTOM = 'flex-end',
}

export class AlignUtils {
	static async getAlignment(
		element: HTMLElement
	): Promise<TextAlign | undefined> {
		if (
			!element ||
			(!this.isElementText(element) && !this.isShapeText(element))
		) {
			return undefined;
		}

		const style: CSSStyleDeclaration = window.getComputedStyle(element);

		if (style.textAlign === 'center') {
			return TextAlign.CENTER;
		} else if (style.textAlign === 'right') {
			return TextAlign.RIGHT;
		} else if (style.textAlign === 'left') {
			return TextAlign.LEFT;
		}

		return this.getDefaultAlignment();
	}

	private static getDefaultAlignment(): TextAlign {
		return isRTL() ? TextAlign.RIGHT : TextAlign.LEFT;
	}

	static async getVerticalAlignment(
		element: HTMLElement
	): Promise<VerticalTextAlign | undefined> {
		if (
			!element ||
			(!this.isElementText(element) && !this.isShapeText(element))
		) {
			return undefined;
		}

		const style: CSSStyleDeclaration = window.getComputedStyle(element);

		if (style.alignItems === 'center') {
			return VerticalTextAlign.MIDDLE;
		} else if (style.alignItems === 'flex-end') {
			return VerticalTextAlign.BOTTOM;
		} else {
			return VerticalTextAlign.TOP;
		}
	}

	private static isShapeText(element: HTMLElement): boolean {
		return (
			element &&
			element.nodeName &&
			element.nodeName.toLowerCase() &&
			[
				SlotType.DRAG_RESIZE_ROTATE.toString(),
				SlotType.DRAG_RESIZE_ROTATE_TEXT.toString(),
			].indexOf(element.nodeName.toLowerCase()) > -1 &&
			element.hasAttribute('text')
		);
	}

	private static isElementText(element: HTMLElement): boolean {
		return (
			element &&
			element.nodeName &&
			[
				SlotType.SECTION.toString(),
				SlotType.H1.toString(),
				SlotType.H2.toString(),
				SlotType.H3.toString(),
				SlotType.OL.toString(),
				SlotType.UL.toString(),
				SlotType.REVEAL.toString(),
				SlotType.REVEAL_LIST.toString(),
				SlotType.MATH.toString(),
				SlotType.WORD_CLOUD.toString(),
				SlotType.MARKDOWN.toString(),
			].indexOf(element.nodeName.toLowerCase()) > -1
		);
	}
}
