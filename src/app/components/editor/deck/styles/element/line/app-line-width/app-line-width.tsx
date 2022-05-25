import {
	Component,
	Element,
	Event,
	EventEmitter,
	State,
	h,
	Prop,
	Watch,
} from '@stencil/core';

import i18n from '../../../../../../../stores/i18n.store';

import {
	LineWidth,
	LineWidthValue,
	LineWidthName,
} from '../../../../../../../types/editor/line-width';

import { setAttribute } from '../../../../../../../utils/editor/undo-redo.deck.utils';

@Component({
	tag: 'app-line-width',
})
export class AppArrow {
	@Element() el: HTMLElement;

	@Prop()
	selectedElement: HTMLElement;

	@State()
	lineWidth: LineWidth | undefined;

	@Event() lineWidthChange: EventEmitter<void>;

	// When we update states on undo / redo it triggers a rerender which triggers the onChange events of Ionic components
	private ignoreUpdateStyle: boolean = false;

	componentWillLoad() {
		this.initLineWidth();
	}

	private initLineWidth() {
		const lineWidth: string =
			this.selectedElement.firstElementChild.getAttribute('line-width');
		this.lineWidth = LineWidthName[`${lineWidth}em`];
	}

	private async changeLineWidth($event: CustomEvent) {
		if (!$event || !$event.detail) {
			return;
		}

		this.lineWidth = $event.detail.value;
		const line: HTMLElement = this.selectedElement.querySelector(
			'deckdeckgo-line, deckdeckgo-line-elbow'
		);
		const lineWidth: string = LineWidthValue[this.lineWidth];

		this.updateAttribute({
			target: line,
			attribute: 'line-width',
			value: `${lineWidth}`,
		});

		line.setAttribute('line-width', `${lineWidth}`);
		this.selectedElement.firstElementChild;
	}

	private updateAttribute({
		target,
		attribute,
		value,
	}: {
		target: HTMLElement;
		attribute: 'line-width';
		value: string;
	}) {
		if (this.ignoreUpdateStyle) {
			this.ignoreUpdateStyle = false;
			return;
		}

		setAttribute(target, {
			attribute: attribute,
			value: value,
			updateUI: async () => {
				// ion-change triggers the event each time its value changes, because we re-render, it triggers it again
				this.ignoreUpdateStyle = true;

				this.initLineWidth();
			},
		});

		this.lineWidthChange.emit();
	}

	render() {
		return (
			<app-expansion-panel>
				<ion-label slot='title'>{i18n.state.editor.line_thickness}</ion-label>
				<ion-list>
					<ion-item class='select properties'>
						<ion-select
							value={this.lineWidth}
							placeholder={i18n.state.editor.select_font_size}
							onIonChange={(e: CustomEvent) => this.changeLineWidth(e)}
							interface='popover'
							mode='md'
							class='ion-padding-start ion-padding-end'>
							{this.renderLineWidthOptions()}
						</ion-select>
					</ion-item>

					<ion-item class='select with-padding css'>
						<ion-select
							value={this.lineWidth}
							placeholder={i18n.state.editor.select_font_size}
							onIonChange={(e: CustomEvent) => this.changeLineWidth(e)}
							interface='popover'
							mode='md'
							class='ion-padding-start ion-padding-end'>
							{this.renderLineWidthOptions()}
						</ion-select>
					</ion-item>
				</ion-list>
			</app-expansion-panel>
		);
	}

	private renderLineWidthOptions() {
		const options = [
			<ion-select-option value={LineWidth.VERY_THIN}>
				{i18n.state.editor.very_thin}
			</ion-select-option>,
			<ion-select-option value={LineWidth.THIN}>
				{i18n.state.editor.thin}
			</ion-select-option>,
			<ion-select-option value={LineWidth.NORMAL}>
				{i18n.state.editor.normal}
			</ion-select-option>,
			<ion-select-option value={LineWidth.THICK}>
				{i18n.state.editor.thick}
			</ion-select-option>,
			<ion-select-option value={LineWidth.VERY_THICK}>
				{i18n.state.editor.very_thick}
			</ion-select-option>,
		];
		return options;
	}
}
