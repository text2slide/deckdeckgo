import {
	Component,
	Element,
	Event,
	EventEmitter,
	h,
	Prop,
	State,
	Fragment,
} from '@stencil/core';

import type { RangeChangeEventDetail } from '@ionic/core';

import settingsStore from '../../../../../../stores/settings.store';
import i18n from '../../../../../../stores/i18n.store';

import { EditMode, Expanded } from '../../../../../../types/core/settings';
import { SlideChartType } from '../../../../../../utils/editor/slide.utils';
import { SettingsUtils } from '../../../../../../utils/core/settings.utils';
import { setAttribute } from '../../../../../../utils/editor/undo-redo.deck.utils';
import { ChartUtils } from '../../../../../../utils/editor/chart.utils';

type Property = 'width' | 'height';

@Component({
	tag: 'app-block-chart',
})
export class AppBlockChart {
	@Element() el: HTMLElement;

	@Prop()
	selectedElement: HTMLElement;

	@State()
	private width: number = 100;

	@State()
	private widthCSS: string;

	@State()
	private height: number = 100;

	@State()
	private heightCSS: string;

	@Event() blockChange: EventEmitter<void>;

	private destroyListener;
	private ignoreUpdateStyle: boolean = false;

	async componentWillLoad() {
		await this.initWidth();
		await this.initHeight();
		// await this.initWidthCSS();
		// await this.initHeightCSS();

		this.destroyListener = settingsStore.onChange(
			'editMode',
			async (edit: EditMode) => {
				// if (edit === 'css') {
				// 	await this.initWidthCSS();
				// 	await this.initHeightCSS();

				// 	return;
				// }

				await this.initWidth();
				await this.initHeight();
			}
		);
	}

	disconnectedCallback() {
		if (this.destroyListener) {
			this.destroyListener();
		}
	}

	private async initWidth() {
		const width: number = parseInt(
			this.selectedElement.getAttribute('chart-width-css')
		);
		this.width = isNaN(width) ? 100 : Math.min(100, width);
	}

	// private async initWidthCSS() {
	// 	this.widthCSS = this.selectedElement.getAttribute('chartWidthCSS');
	// }

	private async initHeight() {
		const height: number = parseInt(
			this.selectedElement.getAttribute('chart-height-css')
		);

		this.height = isNaN(height) ? 100 : Math.min(100, height);
	}

	// private async initHeightCSS() {
	// 	this.heightCSS = this.selectedElement.getAttribute('chartHeightCSS');
	// }

	private updateStyle({
		property,
		value,
	}: {
		property: Property;
		value: string;
	}) {
		if (this.ignoreUpdateStyle) {
			this.ignoreUpdateStyle = false;
			return;
		}

		setAttribute(this.selectedElement, {
			attribute: `chart-${property}-css`,
			value: value,
			updateUI: async () => {
				// ion-change triggers the event each time its value changes, because we re-render, it triggers it again
				this.ignoreUpdateStyle = true;

				// if (settingsStore.state.editMode === 'css') {
				// 	switch (property) {
				// 		case 'width':
				// 			await this.initWidthCSS();
				// 			break;
				// 		case 'height':
				// 			await this.initHeightCSS();
				// 	}

				// 	return;
				// }

				switch (property) {
					case 'width':
						await this.initWidth();
						break;
					case 'height':
						await this.initHeight();
				}
			},
		});
	}

	private async updateSize(
		$event: CustomEvent<RangeChangeEventDetail>,
		property: Property
	) {
		if (
			!$event ||
			!$event.detail ||
			$event.detail.value < 0 ||
			$event.detail.value > 100
		) {
			return;
		}

		$event.stopPropagation();

		this[property] = $event.detail.value as number;

		this.updateStyle({ property: property, value: `${this[property]}%` });

		this.blockChange.emit();
	}

	private handleSizeInput(
		$event: CustomEvent<KeyboardEvent>,
		property: Property
	) {
		this[`${property}CSS`] = ($event.target as InputTargetEvent).value;
	}

	private updateSizeCSS(property: Property) {
		if (!this.selectedElement) {
			return;
		}

		this.updateStyle({ property: property, value: this[`${property}CSS`] });

		this.blockChange.emit();
	}

	render() {
		return (
			<app-expansion-panel
				expanded={settingsStore.state.panels.block}
				onExpansion={($event: CustomEvent<Expanded>) =>
					SettingsUtils.update({ block: $event.detail })
				}>
				<ion-label slot='title'>{i18n.state.editor.block}</ion-label>
				<ion-list>{this.renderWidth()}</ion-list>
				<ion-list>{this.renderHeight()}</ion-list>
			</app-expansion-panel>
		);
	}

	private renderWidth() {
		return (
			<Fragment>
				<ion-item-divider class='ion-padding-top'>
					<ion-label>
						{i18n.state.editor.width}{' '}
						{settingsStore.state.editMode === 'properties' ? (
							<small>{this.width}%</small>
						) : undefined}
					</ion-label>
				</ion-item-divider>
				<ion-item class='item-range properties'>
					<ion-range
						color='dark'
						min={1}
						max={100}
						value={this.width}
						mode='md'
						onIonChange={($event: CustomEvent<RangeChangeEventDetail>) =>
							this.updateSize($event, 'width')
						}></ion-range>
				</ion-item>

				{/* <ion-item class='with-padding css'>
					<ion-input
						value={this.widthCSS}
						placeholder={i18n.state.editor.width}
						debounce={500}
						onIonInput={(e: CustomEvent<KeyboardEvent>) =>
							this.handleSizeInput(e, 'width')
						}
						onIonChange={() => this.updateSizeCSS('width')}></ion-input>
				</ion-item> */}
			</Fragment>
		);
	}

	private renderHeight() {
		return (
			<Fragment>
				<ion-item-divider class='ion-padding-top'>
					<ion-label>
						{i18n.state.editor.height}{' '}
						{settingsStore.state.editMode === 'properties' ? (
							<small>{this.height}%</small>
						) : undefined}
					</ion-label>
				</ion-item-divider>
				<ion-item class='item-range properties'>
					<ion-range
						color='dark'
						min={1}
						max={100}
						value={this.height}
						mode='md'
						onIonChange={($event: CustomEvent<RangeChangeEventDetail>) =>
							this.updateSize($event, 'height')
						}></ion-range>
				</ion-item>

				{/* <ion-item class='with-padding css'>
					<ion-input
						value={this.heightCSS}
						placeholder={i18n.state.editor.height}
						debounce={500}
						onIonInput={(e: CustomEvent<KeyboardEvent>) =>
							this.handleSizeInput(e, 'height')
						}
						onIonChange={() => this.updateSizeCSS('height')}></ion-input>
				</ion-item> */}
			</Fragment>
		);
	}
}
