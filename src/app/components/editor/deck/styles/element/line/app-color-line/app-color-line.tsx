import {
	Component,
	Element,
	Event,
	EventEmitter,
	h,
	Prop,
} from '@stencil/core';

import settingsStore from '../../../../../../../stores/settings.store';
import i18n from '../../../../../../../stores/i18n.store';

import {
	ColorUtils,
	InitStyleColor,
} from '../../../../../../../utils/editor/color.utils';
import { SettingsUtils } from '../../../../../../../utils/core/settings.utils';
import {
	setStyle,
	setAttribute,
} from '../../../../../../../utils/editor/undo-redo.deck.utils';

import { Expanded } from '../../../../../../../types/core/settings';

@Component({
	tag: 'app-color-line',
})
export class AppColorTextBackground {
	@Element() el: HTMLElement;

	@Prop()
	selectedElement: HTMLElement;

	private line: HTMLElement | null;

	private colorRef!: HTMLAppColorElement;

	@Event() colorChange: EventEmitter<void>;

	componentWillLoad() {
		this.line = this.selectedElement.firstElementChild as HTMLElement;
		this.line =
			this.line.tagName.toLowerCase().indexOf('deckdeckgo-line') > -1
				? this.line
				: null;
	}

	private initColor = async (): Promise<InitStyleColor> => {
		if (!this.line) {
			return {
				rgb: null,
				opacity: null,
			};
		}

		return ColorUtils.splitColor(
			this.line.getAttribute('line-color') ||
				this.line.style.getPropertyValue('--linse-color')
		);
	};

	private async applyColor($event: CustomEvent<string>) {
		const selectedColor: string = $event?.detail;
		if (!this.line || !selectedColor) {
			return;
		}

		setAttribute(this.line, {
			attribute: 'line-color',
			value: selectedColor,
			updateUI: async (_value: string) => await this.colorRef.loadColor(),
		});

		this.colorChange.emit();
	}

	private async resetColor() {
		if (!this.line) {
			return;
		}

		this.line.setAttribute('line-color', '');

		this.colorChange.emit();
	}

	render() {
		return (
			<app-expansion-panel
				expanded={settingsStore.state.panels.color}
				onExpansion={($event: CustomEvent<Expanded>) =>
					SettingsUtils.update({ color: $event.detail })
				}>
				<ion-label slot='title'>{i18n.state.editor.color}</ion-label>

				<app-color
					ref={(el) => (this.colorRef = el as HTMLAppColorElement)}
					initColor={this.initColor}
					onResetColor={() => this.resetColor()}
					defaultColor={'#000'}
					onColorDidChange={($event: CustomEvent<string>) =>
						this.applyColor($event)
					}></app-color>
			</app-expansion-panel>
		);
	}
}
