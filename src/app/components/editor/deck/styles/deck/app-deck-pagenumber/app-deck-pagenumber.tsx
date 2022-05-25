import {
	Component,
	Element,
	Event,
	EventEmitter,
	Prop,
	h,
	State,
} from '@stencil/core';

import editorStore from '../../../../../../stores/editor.store';
import i18n from '../../../../../../stores/i18n.store';
import { PagenumberUtils } from '../../../../../../utils/editor/pagenumber.utils';

import { setAttribute } from '../../../../../../utils/editor/undo-redo.deck.utils';

@Component({
	tag: 'app-deck-pagenumber',
	styleUrl: 'app-deck-pagenumber.scss',
})
export class AppDeckPagenumber {
	@Element() el: HTMLElement;

	@Prop()
	deckElement: HTMLDeckgoDeckElement;

	@Prop()
	slideNumber: number;

	@Prop()
	deckDidChange: EventEmitter<HTMLElement>;

	@State()
	private isShowSlideNumber: boolean = false;

	private async appendPageNumber(slideNumber: number) {
		await PagenumberUtils.append(this.deckElement, slideNumber);

		this.deckDidChange.emit(this.deckElement);
	}

	private async reset() {
		await PagenumberUtils.remove(this.deckElement);
	}

	private async onPagenumberShowHide($event: CustomEvent) {
		this.isShowSlideNumber =
			$event && $event.detail ? $event.detail.value : true;

		if (this.isShowSlideNumber === true) {
			this.appendPageNumber(this.slideNumber);
		} else {
			this.reset();
		}
	}

	// *NOTE* render page number expansion panel
	render() {
		return (
			<app-expansion-panel expanded='close'>
				<ion-label slot='title'>{i18n.state.editor.pagenumber}</ion-label>

				<ion-list class='inputs-list'>
					<ion-radio-group
						value={this.isShowSlideNumber}
						onIonChange={($event) => this.onPagenumberShowHide($event)}
						class='inline ion-margin-start'>
						<ion-item>
							<ion-radio value={true} mode='md'></ion-radio>
							<ion-label>{i18n.state.core.yes}</ion-label>
						</ion-item>

						<ion-item>
							<ion-radio value={false} mode='md'></ion-radio>
							<ion-label>{i18n.state.core.no}</ion-label>
						</ion-item>
					</ion-radio-group>
				</ion-list>
			</app-expansion-panel>
		);
	}
}
