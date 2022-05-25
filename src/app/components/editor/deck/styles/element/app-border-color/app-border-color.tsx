import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';

import type { RangeChangeEventDetail } from '@ionic/core';

import settingsStore from '../../../../../../stores/settings.store';

import {
	ColorUtils,
	InitStyleColor,
} from '../../../../../../utils/editor/color.utils';
import { SettingsUtils } from '../../../../../../utils/core/settings.utils';
import i18n from '../../../../../../stores/i18n.store';

import { EditMode, Expanded } from '../../../../../../types/core/settings';
import { setStyle } from '../../../../../../utils/editor/undo-redo.deck.utils';
import { SelectedElement } from '../../../../../../types/editor/selected-element';

@Component({
	tag: 'app-border-color',
})
export class AppBorderColor {
	@Prop()
	selectedElement: SelectedElement;

	@State()
	private readonly defaultBorderProperties = new Map([['border-width', 1]]);

	@State()
	private borderProperties: Map<string, number> = new Map<string, number>(
		this.defaultBorderProperties
	);

	private color: string;

	@State()
	private border: boolean = false;

	@State()
	private borderCSS: string;

	@Event() borderDidChange: EventEmitter<void>;

	private readonly MAX_BORDER_WIDTH: number = 10;

	private destroyListener;

	private ignoreUpdateStyle: boolean = false;

	private colorRef!: HTMLAppColorElement;

	async componentWillLoad() {
		await this.initBorder();
		await this.initBorderCSS();

		this.destroyListener = settingsStore.onChange(
			'editMode',
			async (edit: EditMode) => {
				if (edit === 'css') {
					await this.initBorderCSS();
					return;
				}

				await this.initBorder();
			}
		);
	}

	disconnectedCallback() {
		if (this.destroyListener) {
			this.destroyListener();
		}
	}

	private async initBorderCSS() {
		this.borderCSS = this.selectedElement?.element?.style.border;
	}

	private async initBorder() {
		if (!this.selectedElement || !this.selectedElement.element || !window) {
			return;
		}

		const style: CSSStyleDeclaration = window.getComputedStyle(
			this.selectedElement.element
		);

		if (!style) {
			return;
		}

		if (!style.border || style.border === 'none') {
			return;
		}

		if (style.border === 'none') {
			return;
		}

		this.border = true;
		// style.borderStyle = 'solid'; // set border style

		const rgba: string[] | null = style.boxShadow.match(/rgb.*\)/g);
		this.color = rgba && rgba.length > 0 ? rgba[0] : '0, 0, 0';

		const properties: string[] | null = style.border.split(/rgb.*\)/g);

		if (properties && properties.length > 0) {
			const notEmptyProperties: string[] = properties.filter(
				(property: string) => property !== ''
			);

			if (notEmptyProperties && notEmptyProperties.length > 0) {
				const borderOtherProperties = notEmptyProperties[0]
					.split(/(\s+)/)
					.filter((e) => e.trim().length > 0);

				this.borderProperties.set(
					'border-width',
					Number(borderOtherProperties[0].replace('px', ''))
				);
			}
		}
	}

	private initColor = async (): Promise<InitStyleColor> => {
		if (!this.selectedElement || !this.selectedElement.element) {
			return {
				rgb: null,
				opacity: null,
			};
		}

		const style: CSSStyleDeclaration = window.getComputedStyle(
			this.selectedElement.element
		);

		if (!style) {
			return {
				rgb: null,
				opacity: null,
			};
		}

		if (!style.boxShadow || style.boxShadow === 'none') {
			return {
				rgb: null,
				opacity: null,
			};
		}

		const rgba: string[] | null = style.boxShadow.match(/rgb.*\)/g);

		if (rgba && rgba.length > 0) {
			const styleColor: InitStyleColor = await ColorUtils.splitColor(rgba[0]);

			return {
				rgb: styleColor.rgb ? styleColor.rgb : '0, 0, 0',
				opacity: styleColor.rgb ? styleColor.opacity : 12,
			};
		}

		return {
			rgb: null,
			opacity: null,
		};
	};

	private async selectColor($event: CustomEvent<string>) {
		if (!this.selectedElement) {
			return;
		}

		if (!$event || !$event.detail) {
			return;
		}

		this.color = $event.detail;

		this.border = true;

		await this.updateBorder();
	}

	private emitBorderChange() {
		this.borderDidChange.emit();
	}

	private async updateBorderProperties(
		$event: CustomEvent,
		property: string = ''
	) {
		if (!this.selectedElement || !$event || !$event.detail) {
			return;
		}

		this.borderProperties.set(property, $event.detail.value);
		this.borderProperties = new Map<string, number>(this.borderProperties);

		await this.updateBorder();
	}

	private async updateBorder() {
		this.updateStyle(
			`${this.color} ${this.borderProperties.get('border-width')}px solid`
		);

		this.emitBorderChange();
	}

	private updateStyle(value: string) {
		if (this.ignoreUpdateStyle) {
			this.ignoreUpdateStyle = false;
			return;
		}

		setStyle(this.selectedElement.element, {
			properties: [{ property: 'border', value }],
			type: this.selectedElement.type,
			updateUI: async () => {
				// ion-change triggers the event each time its value changes, because we re-render, it triggers it again
				this.ignoreUpdateStyle = true;

				await this.colorRef.loadColor();

				if (settingsStore.state.editMode === 'css') {
					await this.initBorderCSS();

					return;
				}

				await this.initBorder();
			},
		});
	}

	private async resetBorder() {
		if (!this.selectedElement) {
			return;
		}

		this.updateStyle('');

		this.borderProperties = new Map<string, number>(
			this.defaultBorderProperties
		);

		// Lazy hack, could probably hook on did update and set boxshadow to false afterwards
		// If set directly, components time to time are still enabled
		setTimeout(() => {
			this.border = false;
		}, 150);

		this.emitBorderChange();
	}

	private handleInput($event: CustomEvent<KeyboardEvent>) {
		this.borderCSS = ($event.target as InputTargetEvent).value;
	}

	private async updateLetterSpacingCSS() {
		this.updateStyle(this.borderCSS);

		this.emitBorderChange();
	}

	render() {
		return (
			<app-expansion-panel
				expanded={settingsStore.state.panels.border}
				onExpansion={($event: CustomEvent<Expanded>) =>
					SettingsUtils.update({ border: $event.detail })
				}>
				<ion-label slot='title'>{i18n.state.editor.border}</ion-label>

				<app-color
					ref={(el) => (this.colorRef = el as HTMLAppColorElement)}
					class='ion-margin-top properties'
					initColor={this.initColor}
					onResetColor={() => this.resetBorder()}
					onColorDidChange={($event: CustomEvent<string>) =>
						this.selectColor($event)
					}></app-color>

				<ion-list class='properties'>
					<ion-item-divider class='ion-padding-top'>
						<ion-label>
							{i18n.state.editor.border_width}{' '}
							<small>{this.borderProperties.get('border-width')}px</small>
						</ion-label>
					</ion-item-divider>
					<ion-item class='item-range'>
						<ion-range
							color='dark'
							min={0}
							max={this.MAX_BORDER_WIDTH}
							value={this.borderProperties.get('border-width')}
							mode='md'
							disabled={!this.border}
							onIonChange={($event: CustomEvent<RangeChangeEventDetail>) =>
								this.updateBorderProperties($event, 'border-width')
							}></ion-range>
					</ion-item>
				</ion-list>
			</app-expansion-panel>
		);
	}
} // AppBorderColor
