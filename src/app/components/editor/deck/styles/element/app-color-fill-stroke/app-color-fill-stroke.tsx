import {
	Component,
	Element,
	Event,
	EventEmitter,
	h,
	Prop,
} from '@stencil/core';

import settingsStore from '../../../../../../stores/settings.store';
import i18n from '../../../../../../stores/i18n.store';

import {
	ColorUtils,
	InitStyleColor,
} from '../../../../../../utils/editor/color.utils';
import { SettingsUtils } from '../../../../../../utils/core/settings.utils';
import { setStyle } from '../../../../../../utils/editor/undo-redo.deck.utils';

import { Expanded } from '../../../../../../types/core/settings';

@Component({
	tag: 'app-color-fill-stroke',
})
export class AppColorTextBackground {
	@Element() el: HTMLElement;

	@Prop()
	selectedElement: HTMLElement;

	@Prop()
	slide: boolean = false;

	@Prop()
	deck: boolean = false;

	@Prop()
	colorType: 'fill' | 'stroke' = 'fill';

	private colorRef!: HTMLAppColorElement;

	@Event() colorChange: EventEmitter<void>;

	private initStroke = async (): Promise<InitStyleColor> => {
		if (!this.selectedElement) {
			return {
				rgb: null,
				opacity: null,
			};
		}

		return ColorUtils.splitColor(
			this.selectedElement.style.getPropertyValue('--stroke')
				? this.selectedElement.style.getPropertyValue('--stroke')
				: this.selectedElement.style.stroke
		);
	};

	private initFill = async (): Promise<InitStyleColor> => {
		if (!this.selectedElement) {
			return {
				rgb: null,
				opacity: null,
			};
		}

		return ColorUtils.splitColor(
			this.selectedElement.style.getPropertyValue('--fill')
				? this.selectedElement.style.getPropertyValue('--fill')
				: this.selectedElement.style.fill
		);
	};

	private async applyColor($event: CustomEvent<string>) {
		if (this.colorType === 'stroke') {
			await this.applyStroke($event?.detail);
		} else {
			await this.applyFill($event?.detail);
		}
	}

	private async resetColor() {
		if (!this.selectedElement) {
			return;
		}

		if (this.colorType === 'stroke') {
			this.selectedElement.style.removeProperty('--stroke');
			this.selectedElement.style.removeProperty('stroke');
		} else {
			this.selectedElement.style.removeProperty('--fill');
			this.selectedElement.style.removeProperty('fill');
		}

		this.colorChange.emit();
	}

	private async applyFill(selectedColor: string) {
		if (!this.selectedElement || !selectedColor) {
			return;
		}

		setStyle(this.selectedElement, {
			properties: [
				{
					property: '--fill',
					value: selectedColor,
				},
			],
			type: this.deck ? 'deck' : this.slide ? 'slide' : 'element',
			updateUI: async (_value: string) => await this.colorRef.loadColor(),
		});

		this.colorChange.emit();
	}

	private async applyStroke(selectedColor: string) {
		if (!this.selectedElement || !selectedColor) {
			return;
		}

		setStyle(this.selectedElement, {
			properties: [
				{
					value: selectedColor,
					property: '--stroke',
				},
			],
			type: this.deck ? 'deck' : this.slide ? 'slide' : 'element',
			updateUI: async (_value: string) => await this.colorRef.loadColor(),
		});

		this.colorChange.emit();
	}

	private defaultColor(): string {
		const svg =
			this.selectedElement.firstElementChild.shadowRoot.querySelector('svg');
		const isStroke: boolean =
			svg.getAttribute('data-icon').indexOf('outlined') > -1;

		return this.colorType === 'stroke'
			? isStroke //stroke
				? '#000'
				: 'transparent'
			: isStroke // fill
			? '#222'
			: '#000';
	}

	render() {
		return (
			<app-expansion-panel
				expanded={
					this.colorType === 'fill'
						? settingsStore.state.panels.fill
						: settingsStore.state.panels.stroke
				}
				onExpansion={($event: CustomEvent<Expanded>) =>
					SettingsUtils.update(
						this.colorType === 'fill'
							? { fill: $event.detail }
							: { stroke: $event.detail }
					)
				}>
				<ion-label slot='title'>{i18n.state.editor[this.colorType]}</ion-label>

				<app-color
					ref={(el) => (this.colorRef = el as HTMLAppColorElement)}
					initColor={this.colorType === 'stroke' ? this.initStroke : this.initFill}
					onResetColor={() => this.resetColor()}
					defaultColor={this.defaultColor()}
					onColorDidChange={($event: CustomEvent<string>) =>
						this.applyColor($event)
					}></app-color>
			</app-expansion-panel>
		);
	}
}
