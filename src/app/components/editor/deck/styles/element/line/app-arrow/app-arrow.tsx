import {
	Component,
	Element,
	Event,
	EventEmitter,
	h,
	Prop,
	State,
	Watch,
} from '@stencil/core';

import i18n from '../../../../../../../stores/i18n.store';
import { setAttribute } from '../../../../../../../utils/editor/undo-redo.deck.utils';

@Component({
	tag: 'app-arrow',
})
export class AppArrow {
	@Element() el: HTMLElement;

	@Prop()
	selectedElement: HTMLElement;

	@Event() arrowChange: EventEmitter<void>;

	private lineElement: HTMLElement;

	@State()
	headerArrow: boolean = false;

	@State()
	footerArrow: boolean = false;

	// When we update states on undo / redo it triggers a rerender which triggers the onChange events of Ionic components
	private ignoreUpdateStyle: boolean = false;

	componentWillLoad() {
		this.lineElement = this.selectedElement.firstElementChild as HTMLElement;
		this.headerArrow = this.lineElement.getAttribute('start-arrow') === 'true';
		this.footerArrow = this.lineElement.getAttribute('end-arrow') === 'true';
	}

	@Watch('headerArrow')
	onHeaderArrowChange(newValue: boolean) {
		this.toggleArrow('start-arrow', newValue);
	}

	@Watch('footerArrow')
	onFooterArrowChange(newValue: boolean) {
		this.toggleArrow('end-arrow', newValue);
	}

	private updateArrow($event: CustomEvent) {
		const element = $event.target as HTMLInputElement;
		this.toggleArrow(
			element.name as 'start-arrow' | 'end-arrow',
			$event.detail.checked
		);
	}

	private toggleArrow(arrowType: 'start-arrow' | 'end-arrow', show: boolean) {
		this.updateAttribute({
			target: this.lineElement,
			arrowType: arrowType,
			value: show,
		});
		this.lineElement.setAttribute(arrowType, `${show}`);
	}

	private updateAttribute({
		target,
		arrowType,
		value,
	}: {
		target: HTMLElement;
		arrowType: 'start-arrow' | 'end-arrow';
		value: boolean;
	}) {
		if (this.ignoreUpdateStyle) {
			this.ignoreUpdateStyle = false;
			return;
		}

		setAttribute(target, {
			attribute: arrowType,
			value: value.toString(),
			updateUI: async () => {
				// ion-change triggers the event each time its value changes, because we re-render, it triggers it again
				this.ignoreUpdateStyle = true;

				this[arrowType === 'start-arrow' ? 'headerArrow' : 'footerArrow'] = value;
			},
		});

		this.arrowChange.emit();
	}

	render() {
		return (
			<app-expansion-panel>
				<ion-label slot='title'>{i18n.state.editor.arrow}</ion-label>

				<ion-item>
					<ion-label>{i18n.state.editor.header}</ion-label>
					<ion-toggle
						name='start-arrow'
						checked={this.headerArrow}
						onIonChange={($event) => this.updateArrow($event)}></ion-toggle>
				</ion-item>

				<ion-item>
					<ion-label>{i18n.state.editor.footer}</ion-label>
					<ion-toggle
						name='end-arrow'
						checked={this.footerArrow}
						onIonChange={($event) => this.updateArrow($event)}></ion-toggle>
				</ion-item>
			</app-expansion-panel>
		);
	}
}
