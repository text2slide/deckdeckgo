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

import i18n from '../../../../../../stores/i18n.store';

import {
	LineWidth,
	StrokeWidthValue,
	StrokeWidthName,
} from '../../../../../../types/editor/line-width';

import {
	setStyle,
	setAttribute,
} from '../../../../../../utils/editor/undo-redo.deck.utils';

@Component({
	tag: 'app-stroke-width',
})
export class AppArrow {
	@Element() el: HTMLElement;

	@Prop()
	selectedElement: HTMLElement;

	@State()
	strokeWidth: LineWidth | undefined;

	@Event() strokeWidthChange: EventEmitter<void>;

	// When we update states on undo / redo it triggers a rerender which triggers the onChange events of Ionic components
	private ignoreUpdateStyle: boolean = false;

	componentWillLoad() {
		this.initStrokeWidth();
	}

	private initStrokeWidth() {
		const strokeWidth: string = window
			.getComputedStyle(this.selectedElement)
			.getPropertyValue('--stroke-width');

		this.strokeWidth = StrokeWidthName[strokeWidth];
	}

	private async changeStrokeWidth($event: CustomEvent) {
		if (!$event || !$event.detail) {
			return;
		}

		this.strokeWidth = $event.detail.value;

		const strokeWidth: string = StrokeWidthValue[this.strokeWidth];
		this.applyStrokeWidth(strokeWidth);
	}

	private applyStrokeWidth(strokeValue: string) {
		if (!this.selectedElement || !this.strokeWidth) {
			return;
		}

		if (this.ignoreUpdateStyle) {
			this.ignoreUpdateStyle = false;
			return;
		}

		setStyle(this.selectedElement, {
			properties: [
				{
					property: '--stroke-width',
					value: strokeValue,
				},
			],
			type: 'element',
			updateUI: async () => {
				// ion-change triggers the event each time its value changes, because we re-render, it triggers it again
				this.ignoreUpdateStyle = true;

				this.initStrokeWidth();
			},
		});

		this.strokeWidthChange.emit();
	}

	render() {
		return (
			<app-expansion-panel>
				<ion-label slot='title'>{i18n.state.editor.stroke_width}</ion-label>
				<ion-list>
					<ion-item class='select properties'>
						<ion-select
							value={this.strokeWidth}
							placeholder={i18n.state.editor.select_stroke_width}
							onIonChange={(e: CustomEvent) => this.changeStrokeWidth(e)}
							interface='popover'
							mode='md'
							class='ion-padding-start ion-padding-end'>
							{this.renderStrokeWidthOptions()}
						</ion-select>
					</ion-item>

					<ion-item class='select css'>
						<ion-select
							value={this.strokeWidth}
							placeholder={i18n.state.editor.select_stroke_width}
							onIonChange={(e: CustomEvent) => this.changeStrokeWidth(e)}
							interface='popover'
							mode='md'
							class='ion-padding-start ion-padding-end'>
							{this.renderStrokeWidthOptions()}
						</ion-select>
					</ion-item>
				</ion-list>
			</app-expansion-panel>
		);
	}

	private renderStrokeWidthOptions() {
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
