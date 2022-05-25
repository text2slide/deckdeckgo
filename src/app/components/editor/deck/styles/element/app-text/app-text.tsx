import {
	Component,
	Event,
	EventEmitter,
	Fragment,
	h,
	Prop,
	State,
} from '@stencil/core';

import settingsStore from '../../../../../../stores/settings.store';
import i18n from '../../../../../../stores/i18n.store';

import { SettingsUtils } from '../../../../../../utils/core/settings.utils';

import { EditMode, Expanded } from '../../../../../../types/core/settings';
import { FontSize } from '../../../../../../types/editor/font-size';
import { SelectedElement } from '../../../../../../types/editor/selected-element';

import {
	AlignUtils,
	TextAlign,
	VerticalTextAlign,
} from '../../../../../../utils/editor/align.utils';

import {
	initFontSize,
	toggleFontSize,
} from '../../../../../../utils/editor/font-size.utils';
import { setStyle } from '../../../../../../utils/editor/undo-redo.deck.utils';
import { FontsService } from '../../../../../../services/editor/fonts/fonts.service';

enum SpacingStyle {
	TIGHTER,
	TIGHT,
	NORMAL,
	WIDE,
	WIDER,
	SUPERWIDE,
	WIDEST,
}

@Component({
	tag: 'app-text',
	styleUrl: 'app-text.scss',
})
export class AppText {
	@Prop()
	deckDidChange: EventEmitter<HTMLElement>;

	@Prop()
	selectedElement: SelectedElement;

	@State()
	private align: TextAlign | undefined;

	@State()
	private verticalAlign: VerticalTextAlign | undefined;

	@State()
	private alignCSS: string;

	@State()
	private verticalAlignCSS: string;

	@State()
	private letterSpacing: SpacingStyle = SpacingStyle.NORMAL;

	@State()
	private letterSpacingCSS: string;

	@State()
	private fontSize: FontSize | undefined = undefined;

	@State()
	private fontSizeCSS: string;

	@State()
	private lineHeight: SpacingStyle = SpacingStyle.NORMAL;

	@State()
	private lineHeightCSS: string;

	@State()
	private fontFamily: string | undefined;

	@State()
	private fonts: GoogleFont[];

	@Event() fontsChange: EventEmitter<void>;

	@Event() textDidChange: EventEmitter<void>;

	private destroyListener;

	// When we update states on undo / redo it triggers a rerender which triggers the onChange events of Ionic components
	private ignoreUpdateStyle: boolean = false;

	private fontsService: FontsService;

	constructor() {
		this.fontsService = FontsService.getInstance();
	}

	async componentWillLoad() {
		// this.deckElement = document?.querySelector('app-editor main deckgo-deck');
		await this.init();

		await this.initCSS();

		this.destroyListener = settingsStore.onChange(
			'editMode',
			async (edit: EditMode) => {
				if (edit === 'css') {
					await this.initCSS();
					return;
				}

				await this.init();
			}
		);
	}

	disconnectedCallback() {
		if (this.destroyListener) {
			this.destroyListener();
		}
	}

	private async init() {
		this.letterSpacing = await this.initLetterSpacing();
		this.lineHeight = await this.initLineHeight();
		this.align = await AlignUtils.getAlignment(this.selectedElement?.element);
		this.verticalAlign = await AlignUtils.getVerticalAlignment(
			this.selectedElement?.element
		);
		this.fontSize = await initFontSize(this.selectedElement?.element);
		this.fontFamily = await this.initSelectedFont();
		this.fonts = await this.fontsService.loadAllGoogleFonts();
	}

	private initSelectedFont(): Promise<string | undefined> {
		return new Promise<string | undefined>((resolve) => {
			if (
				!this.selectedElement.element ||
				!this.selectedElement.element.style ||
				!this.selectedElement.element.style.getPropertyValue('font-family')
			) {
				this.fontFamily = undefined;
				resolve(undefined);
				return;
			}

			const selectedFont = this.selectedElement.element.style
				.getPropertyValue('font-family')
				.replace(/\'/g, '')
				.replace(/"/g, '');

			resolve(selectedFont);
		});
	}

	// Start of Typography related method

	private async selectFont(font: GoogleFont | null) {
		if (!this.selectedElement.element) {
			return;
		}
		this.updateFontFamilyCSS(font.family);
		this.fontsChange.emit();
	}

	private renderFonts() {
		return (
			<app-expansion-panel>
				<ion-label slot='title'>{i18n.state.editor.typography}</ion-label>
				<div class='container ion-margin-bottom'>
					{this.renderDefaultFont(this.fontFamily === undefined)}
					{this.renderGoogleFonts()}
				</div>
			</app-expansion-panel>
		);
	}

	private renderGoogleFonts() {
		if (this.fonts === undefined) {
			return undefined;
		}

		return this.fonts.map((font: GoogleFont) => {
			return this.renderFont(
				font,
				this.fontFamily === font.family.replace(/\'/g, '')
			);
		});
	}

	private renderDefaultFont(selected: boolean) {
		return (
			<div
				class={`item ${selected ? 'selected' : ''}`}
				custom-tappable
				onClick={() => this.selectFont(null)}>
				<deckgo-slide-title class='showcase'>
					<p slot='title' class='default'>
						{i18n.state.editor.default}
					</p>
				</deckgo-slide-title>
			</div>
		);
	}

	private renderFont(font: GoogleFont, selected: boolean) {
		return (
			<div
				class={`item ${selected ? 'selected' : ''}`}
				custom-tappable
				onClick={() => this.selectFont(font)}>
				<deckgo-slide-title class='showcase'>
					<p slot='title' style={{ 'font-family': font.family }}>
						{font.name}
					</p>
				</deckgo-slide-title>
			</div>
		);
	}

	// End of Typography related method

	private async initLetterSpacing(): Promise<SpacingStyle> {
		if (!this.selectedElement || !this.selectedElement.element) {
			return SpacingStyle.NORMAL;
		}

		const spacing: string = this.selectedElement.element.style.letterSpacing;

		if (!spacing || spacing === '') {
			return SpacingStyle.NORMAL;
		}

		if (spacing === '-0.1em') {
			return SpacingStyle.TIGHTER;
		} else if (spacing === '-0.05em') {
			return SpacingStyle.TIGHT;
		} else if (spacing === '0.1em') {
			return SpacingStyle.WIDE;
		} else if (spacing === '0.2em') {
			return SpacingStyle.WIDER;
		} else if (spacing === '0.3em') {
			return SpacingStyle.SUPERWIDE;
		} else if (spacing === '0.4em') {
			return SpacingStyle.WIDEST;
		}

		return SpacingStyle.NORMAL;
	}

	private async updateLetterSpacing($event: CustomEvent): Promise<void> {
		if (
			!this.selectedElement ||
			!this.selectedElement.element ||
			!$event ||
			!$event.detail
		) {
			return;
		}

		let letterSpacingConverted = '';
		switch ($event.detail.value) {
			case SpacingStyle.TIGHTER:
				letterSpacingConverted = '-0.1em';
				break;
			case SpacingStyle.TIGHT:
				letterSpacingConverted = '-0.05em';
				break;
			case SpacingStyle.WIDE:
				letterSpacingConverted = '0.1em';
				break;
			case SpacingStyle.WIDER:
				letterSpacingConverted = '0.2em';
				break;
			case SpacingStyle.SUPERWIDE:
				letterSpacingConverted = '0.3em';
				break;
			case SpacingStyle.WIDEST:
				letterSpacingConverted = '0.4em';
				break;
			default:
				letterSpacingConverted = 'normal';
		}

		this.letterSpacing = $event.detail.value;

		this.updateLetterSpacingCSS(letterSpacingConverted);
	}

	private async initLineHeight(): Promise<SpacingStyle> {
		if (!this.selectedElement || !this.selectedElement.element) {
			return SpacingStyle.NORMAL;
		}

		const spacing: string = this.selectedElement.element.style.lineHeight;

		if (!spacing || spacing === '') {
			return SpacingStyle.NORMAL;
		}

		if (spacing === '0.5') {
			return SpacingStyle.TIGHTER;
		} else if (spacing === '0.8') {
			return SpacingStyle.TIGHT;
		} else if (spacing === '1.4') {
			return SpacingStyle.WIDE;
		} else if (spacing === '1.6') {
			return SpacingStyle.WIDER;
		} else if (spacing === '1.8') {
			return SpacingStyle.SUPERWIDE;
		} else if (spacing === '2') {
			return SpacingStyle.WIDEST;
		}

		return SpacingStyle.NORMAL;
	}

	private async updateLineHeight($event: CustomEvent): Promise<void> {
		if (
			!this.selectedElement ||
			!this.selectedElement.element ||
			!$event ||
			!$event.detail
		) {
			return;
		}

		let lineHeightConverted = '';
		switch ($event.detail.value) {
			case SpacingStyle.TIGHTER:
				lineHeightConverted = '0.5';
				break;
			case SpacingStyle.TIGHT:
				lineHeightConverted = '0.8';
				break;
			case SpacingStyle.WIDE:
				lineHeightConverted = '1.4';
				break;
			case SpacingStyle.WIDER:
				lineHeightConverted = '1.6';
				break;
			case SpacingStyle.SUPERWIDE:
				lineHeightConverted = '1.8';
				break;
			case SpacingStyle.WIDEST:
				lineHeightConverted = '2';
				break;
			default:
				lineHeightConverted = 'normal';
		}

		this.lineHeight = $event.detail.value;

		this.updateLineHeightCSS(lineHeightConverted);
	}

	private async initCSS() {
		this.letterSpacingCSS = this.selectedElement?.element?.style.letterSpacing;
		this.lineHeightCSS = this.selectedElement?.element?.style.lineHeight;
		this.alignCSS = this.selectedElement?.element?.style.textAlign;
		this.fontSizeCSS = this.selectedElement?.element?.style.fontSize;
	}

	private handleLetterSpacingInput($event: CustomEvent<KeyboardEvent>) {
		this.letterSpacingCSS = ($event.target as InputTargetEvent).value;
	}

	private updateLetterSpacingCSS(letterSpacingCSS: string) {
		this.updateStyle({ property: 'letter-spacing', value: letterSpacingCSS });

		this.textDidChange.emit();
	}

	private handleLineHeightInput($event: CustomEvent<KeyboardEvent>) {
		this.lineHeightCSS = ($event.target as InputTargetEvent).value;
	}

	private updateLineHeightCSS(lineHeightCSS: string) {
		this.updateStyle({ property: 'line-height', value: lineHeightCSS });

		this.textDidChange.emit();
	}

	private updateFontFamilyCSS(fontFamilyCSS: string) {
		this.updateStyle({ property: 'font-family', value: fontFamilyCSS });
		this.textDidChange.emit();
	}

	private updateStyle({
		property,
		value,
	}: {
		property:
			| 'letter-spacing'
			| 'text-align'
			| 'align-items'
			| 'font-size'
			| 'font-family'
			| 'line-height';
		value: string;
	}) {
		if (this.ignoreUpdateStyle) {
			this.ignoreUpdateStyle = false;
			return;
		}

		setStyle(this.selectedElement.element, {
			properties: [{ property, value }],
			type: this.selectedElement.type,
			updateUI: async () => {
				// ion-change triggers the event each time its value changes, because we re-render, it triggers it again
				this.ignoreUpdateStyle = true;

				if (settingsStore.state.editMode === 'css') {
					switch (property) {
						case 'letter-spacing':
							this.letterSpacingCSS =
								this.selectedElement?.element?.style.letterSpacing;
							break;
						case 'font-size':
							this.fontSizeCSS = this.selectedElement?.element?.style.fontSize;
							break;
						case 'text-align':
							this.alignCSS = this.selectedElement?.element?.style.textAlign;
							break;
						case 'align-items':
							this.verticalAlignCSS = this.selectedElement?.element?.style.alignItems;
							break;
						case 'line-height':
							this.lineHeightCSS = this.selectedElement?.element?.style.lineHeight;
							break;
					}

					return;
				}

				switch (property) {
					case 'letter-spacing':
						this.letterSpacing = await this.initLetterSpacing();
						break;
					case 'font-size':
						this.fontSize = await initFontSize(this.selectedElement?.element);
						break;
					case 'text-align':
						this.align = await AlignUtils.getAlignment(this.selectedElement?.element);
						break;
					case 'align-items':
						this.verticalAlign = await AlignUtils.getVerticalAlignment(
							this.selectedElement?.element
						);
						break;
					case 'font-family':
						this.fontFamily = await this.initSelectedFont();
						break;
					case 'line-height':
						this.lineHeight = await this.initLineHeight();
						break;
				}
			},
		});
	}

	private async updateAlign($event: CustomEvent): Promise<void> {
		if (
			!this.selectedElement ||
			!this.selectedElement.element ||
			!$event ||
			!$event.detail
		) {
			return;
		}

		this.align = $event.detail.value;

		this.updateAlignCSS($event.detail.value);
	}

	private handleAlignInput($event: CustomEvent<KeyboardEvent>) {
		this.alignCSS = ($event.target as InputTargetEvent).value as TextAlign;
	}

	private updateAlignCSS(alignCSS: string) {
		if (!this.selectedElement || !this.selectedElement.element) {
			return;
		}

		this.updateStyle({ property: 'text-align', value: alignCSS });

		this.textDidChange.emit();
	}

	private async updateVerticalAlign($event: CustomEvent): Promise<void> {
		if (
			!this.selectedElement ||
			!this.selectedElement.element ||
			!$event ||
			!$event.detail
		) {
			return;
		}

		this.verticalAlign = $event.detail.value;

		this.updateVerticalAlignCSS($event.detail.value);
	}

	private handleVerticalAlignInput($event: CustomEvent<KeyboardEvent>) {
		this.verticalAlignCSS = ($event.target as InputTargetEvent)
			.value as VerticalTextAlign;
	}

	private updateVerticalAlignCSS(verticalAlignCSS: string) {
		if (!this.selectedElement || !this.selectedElement.element) {
			return;
		}

		this.updateStyle({ property: 'align-items', value: verticalAlignCSS });

		this.textDidChange.emit();
	}

	private async toggleFontSize($event: CustomEvent) {
		if (!$event || !$event.detail) {
			return;
		}

		this.fontSize = $event.detail.value;

		if (!this.selectedElement || !this.selectedElement.element) {
			return;
		}

		const size: string | undefined = toggleFontSize(
			this.selectedElement.element,
			this.fontSize
		);

		if (!size) {
			return;
		}

		this.updateFontSizeCSS(size);
	}

	private handleInput($event: CustomEvent<KeyboardEvent>) {
		this.fontSizeCSS = ($event.target as InputTargetEvent).value;
	}

	private updateFontSizeCSS(size: string) {
		this.updateStyle({ property: 'font-size', value: size });

		this.textDidChange.emit();
	}

	// private onDeckChange() {
	//   this.deckDidChange.emit(this.deckElement);
	// }

	render() {
		return (
			<Fragment>
				<app-expansion-panel
					expanded={settingsStore.state.panels.text}
					onExpansion={($event: CustomEvent<Expanded>) =>
						SettingsUtils.update({ text: $event.detail })
					}>
					<ion-label slot='title'>{i18n.state.editor.text}</ion-label>
					<ion-list>
						{this.renderFontSize()}
						{this.renderLetterSpacing()}
						{this.renderLineHeight()}
						{this.renderAlign()}
						{this.renderVerticalAlign()}
					</ion-list>
				</app-expansion-panel>
				{this.selectedElement.type === 'element' && this.renderFonts()}
			</Fragment>
		);
	}

	private renderFontSize() {
		return (
			<Fragment>
				<ion-item-divider>
					<ion-label>{i18n.state.editor.scale}</ion-label>
				</ion-item-divider>

				<ion-item class='select properties'>
					<ion-label>{i18n.state.editor.size}</ion-label>

					<ion-select
						value={this.fontSize}
						placeholder={i18n.state.editor.select_font_size}
						onIonChange={($event: CustomEvent) => this.toggleFontSize($event)}
						interface='popover'
						mode='md'
						class='ion-padding-start ion-padding-end'>
						<ion-select-option value={FontSize.VERY_SMALL}>
							{i18n.state.editor.very_small}
						</ion-select-option>
						<ion-select-option value={FontSize.SMALL}>
							{i18n.state.editor.small}
						</ion-select-option>
						<ion-select-option value={FontSize.NORMAL}>
							{i18n.state.editor.normal}
						</ion-select-option>
						<ion-select-option value={FontSize.BIG}>
							{i18n.state.editor.big}
						</ion-select-option>
						<ion-select-option value={FontSize.VERY_BIG}>
							{i18n.state.editor.very_big}
						</ion-select-option>
						{this.fontSize === FontSize.CUSTOM ? (
							<ion-select-option value={FontSize.CUSTOM}>
								{i18n.state.editor.custom}
							</ion-select-option>
						) : undefined}
					</ion-select>
				</ion-item>

				<ion-item class='with-padding css'>
					<ion-input
						value={this.fontSizeCSS}
						placeholder='font-size'
						debounce={500}
						onIonInput={(e: CustomEvent<KeyboardEvent>) => this.handleInput(e)}
						onIonChange={() => this.updateFontSizeCSS(this.fontSizeCSS)}></ion-input>
				</ion-item>
			</Fragment>
		);
	}

	private renderLetterSpacing() {
		return (
			<Fragment>
				<ion-item-divider>
					<ion-label>{i18n.state.editor.letter_spacing}</ion-label>
				</ion-item-divider>

				<ion-item class='select properties'>
					<ion-label>{i18n.state.editor.letter_spacing}</ion-label>
					<ion-select
						value={this.letterSpacing}
						placeholder={i18n.state.editor.letter_spacing}
						onIonChange={($event: CustomEvent) => this.updateLetterSpacing($event)}
						interface='popover'
						mode='md'
						class='ion-padding-start ion-padding-end'>
						<ion-select-option value={SpacingStyle.TIGHTER}>
							{i18n.state.editor.tighter}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.TIGHT}>
							{i18n.state.editor.tight}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.NORMAL}>
							{i18n.state.editor.normal}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.WIDE}>
							{i18n.state.editor.wide}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.WIDER}>
							{i18n.state.editor.wider}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.SUPERWIDE}>
							{i18n.state.editor.superwide}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.WIDEST}>
							{i18n.state.editor.widest}
						</ion-select-option>
					</ion-select>
				</ion-item>

				<ion-item class='with-padding css'>
					<ion-input
						value={this.letterSpacingCSS}
						placeholder={i18n.state.editor.letter_spacing}
						debounce={500}
						onIonInput={(e: CustomEvent<KeyboardEvent>) =>
							this.handleLetterSpacingInput(e)
						}
						onIonChange={() =>
							this.updateLetterSpacingCSS(this.letterSpacingCSS)
						}></ion-input>
				</ion-item>
			</Fragment>
		);
	}

	private renderLineHeight() {
		return (
			<Fragment>
				<ion-item-divider>
					<ion-label>{i18n.state.editor.line_height}</ion-label>
				</ion-item-divider>

				<ion-item class='select properties'>
					<ion-label>{i18n.state.editor.line_height}</ion-label>
					<ion-select
						value={this.lineHeight}
						placeholder={i18n.state.editor.line_height}
						onIonChange={($event: CustomEvent) => this.updateLineHeight($event)}
						interface='popover'
						mode='md'
						class='ion-padding-start ion-padding-end'>
						<ion-select-option value={SpacingStyle.TIGHTER}>
							{i18n.state.editor.tighter}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.TIGHT}>
							{i18n.state.editor.tight}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.NORMAL}>
							{i18n.state.editor.normal}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.WIDE}>
							{i18n.state.editor.wide}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.WIDER}>
							{i18n.state.editor.wider}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.SUPERWIDE}>
							{i18n.state.editor.superwide}
						</ion-select-option>
						<ion-select-option value={SpacingStyle.WIDEST}>
							{i18n.state.editor.widest}
						</ion-select-option>
					</ion-select>
				</ion-item>

				<ion-item class='with-padding css'>
					<ion-input
						value={this.lineHeightCSS}
						placeholder={i18n.state.editor.line_height}
						debounce={500}
						onIonInput={(e: CustomEvent<KeyboardEvent>) =>
							this.handleLineHeightInput(e)
						}
						onIonChange={() =>
							this.updateLineHeightCSS(this.lineHeightCSS)
						}></ion-input>
				</ion-item>
			</Fragment>
		);
	}

	private renderAlign() {
		if (this.align === undefined) {
			return undefined;
		}

		return (
			<Fragment>
				<ion-item-divider>
					<ion-label>{i18n.state.editor.alignment}</ion-label>
				</ion-item-divider>

				<ion-item class='select properties'>
					<ion-label>{i18n.state.editor.alignment}</ion-label>

					<ion-select
						value={this.align}
						placeholder={i18n.state.editor.alignment}
						onIonChange={($event: CustomEvent) => this.updateAlign($event)}
						interface='popover'
						mode='md'
						class='ion-padding-start ion-padding-end'>
						<ion-select-option value={TextAlign.LEFT}>
							{i18n.state.editor.left}
						</ion-select-option>
						<ion-select-option value={TextAlign.CENTER}>
							{i18n.state.editor.center}
						</ion-select-option>
						<ion-select-option value={TextAlign.RIGHT}>
							{i18n.state.editor.right}
						</ion-select-option>
					</ion-select>
				</ion-item>

				<ion-item class='with-padding css'>
					<ion-input
						value={this.alignCSS}
						placeholder={i18n.state.editor.text_align}
						debounce={500}
						onIonInput={(e: CustomEvent<KeyboardEvent>) => this.handleAlignInput(e)}
						onIonChange={() => this.updateAlignCSS(this.alignCSS)}></ion-input>
				</ion-item>
			</Fragment>
		);
	}

	private renderVerticalAlign() {
		if (this.verticalAlign === undefined) {
			return undefined;
		}

		return (
			<Fragment>
				<ion-item-divider>
					<ion-label>{i18n.state.editor.vertical_alignment}</ion-label>
				</ion-item-divider>

				<ion-item class='select properties'>
					<ion-label>{i18n.state.editor.vertical_alignment}</ion-label>

					<ion-select
						value={this.verticalAlign}
						placeholder={i18n.state.editor.vertical_alignment}
						onIonChange={($event: CustomEvent) => this.updateVerticalAlign($event)}
						interface='popover'
						mode='md'
						class='ion-padding-start ion-padding-end'>
						<ion-select-option value={VerticalTextAlign.TOP}>
							{i18n.state.editor.top}
						</ion-select-option>
						<ion-select-option value={VerticalTextAlign.MIDDLE}>
							{i18n.state.editor.middle}
						</ion-select-option>
						<ion-select-option value={VerticalTextAlign.BOTTOM}>
							{i18n.state.editor.bottom}
						</ion-select-option>
					</ion-select>
				</ion-item>

				<ion-item class='with-padding css'>
					<ion-input
						value={this.alignCSS}
						placeholder={i18n.state.editor.text_align}
						debounce={500}
						onIonInput={(e: CustomEvent<KeyboardEvent>) =>
							this.handleVerticalAlignInput(e)
						}
						onIonChange={() =>
							this.updateVerticalAlignCSS(this.verticalAlignCSS)
						}></ion-input>
				</ion-item>
			</Fragment>
		);
	}
}
