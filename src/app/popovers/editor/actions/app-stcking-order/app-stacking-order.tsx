import {
	Component,
	Element,
	h,
	Prop,
	Event,
	EventEmitter,
	JSX,
	Watch,
	State,
} from '@stencil/core';

import deckEditorStore from '../../../../stores/deck-editor.store';
import i18n from '../../../../stores/i18n.store';

@Component({
	tag: 'app-stacking-order',
	styleUrl: 'app-stacking-order.scss',
})
export class AppCopyStyle {
	@Element() el: HTMLElement;

	@Prop()
	selectedElement: HTMLElement;

	@Prop()
	activeSlideChildren: JSX.IntrinsicElements;

	@State()
	maxZIndex: number = 0;

	@State()
	minZIndex: number = 0;

	@State()
	slideChildrenElement: HTMLCollection;

	@State()
	parentSlideElement: HTMLElement;

	@Event() optionsDidChange: EventEmitter<void>;

	constructor() {
		const parentSlideElement = this.findParentSlideElement();
		this.parentSlideElement = parentSlideElement;
		this.slideChildrenElement = parentSlideElement.children as HTMLCollection;
	}

	private findParentSlideElement(): HTMLElement {
		const parentSlideElement = this.selectedElement.parentElement;
		if (
			parentSlideElement.tagName === 'DECKGO-SLIDE-ASPECT-RATIO' ||
			parentSlideElement.tagName.includes('ASPECT-RATIO') ||
			parentSlideElement.tagName.includes('TITLE')
		) {
			return parentSlideElement;
		}
		return this.findParentSlideElement();
	}

	private async closePopover(detail: {
		stacking: 1 | -1;
		action: 'bringToFront' | 'sendToBack';
	}) {
		await (this.el.closest('ion-popover') as HTMLIonPopoverElement).dismiss({
			...detail,
		});
	}

	private findSelectedElementIndex(): number {
		return Array.from(this.slideChildrenElement).indexOf(this.selectedElement);
	}

	private bringToFront() {
		const targetIndex = this.findSelectedElementIndex();
		if (targetIndex === this.slideChildrenElement.length - 1) return;
		this.parentSlideElement.removeChild(this.selectedElement);
		const insertTargetNode = this.parentSlideElement.children[targetIndex + 1];
		this.parentSlideElement.insertBefore(
			this.selectedElement,
			insertTargetNode
		);
		this.closePopover({ stacking: 1, action: 'bringToFront' });
		this.optionsDidChange.emit();
	}

	private sendToBack() {
		const targetIndex = this.findSelectedElementIndex();
		if (targetIndex === 0) return;
		this.parentSlideElement.removeChild(this.selectedElement);
		const insertTargetNode = this.parentSlideElement.children[targetIndex - 1];
		this.parentSlideElement.insertBefore(
			this.selectedElement,
			insertTargetNode
		);
		this.closePopover({ stacking: -1, action: 'sendToBack' });
		this.optionsDidChange.emit();
	}

	render() {
		const targetIndex = this.findSelectedElementIndex();
		const disableSendToBack = targetIndex === 0;
		const disableBringToFront =
			targetIndex === this.slideChildrenElement.length - 1;
		return (
			<div class='ion-padding'>
				<a
					onClick={() => (disableBringToFront ? null : this.bringToFront())}
					aria-label={i18n.state.editor.bring_to_front}
					class={disableBringToFront ? 'disabled' : undefined}>
					<p>{i18n.state.editor.bring_to_front}</p>
				</a>

				<a
					onClick={() => (disableSendToBack ? null : this.sendToBack())}
					aria-label={i18n.state.editor.send_to_back}
					class={disableSendToBack ? 'disabled' : undefined}>
					<p>{i18n.state.editor.send_to_back}</p>
				</a>
			</div>
		);
	}
}
