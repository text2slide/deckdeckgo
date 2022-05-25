import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Prop,
  State,
} from '@stencil/core';

import i18n from '../../../../../../stores/i18n.store';

import { ChartUtils } from '../../../../../../utils/editor/chart.utils';
import { FontSize } from '../../../../../../types/editor/font-size';
import { FontsService } from '../../../../../../services/editor/fonts/fonts.service';
import { SlideChartType } from '../../../../../../utils/editor/slide.utils';

enum FontSizeValue {
  'VERY_SMALL' = '6',
  'SMALL' = '8',
  'NORMAL' = '10',
  'BIG' = '14',
  'VERY_BIG' = '18',
}

@Component({
  tag: 'app-text-chart',
  styleUrl: 'app-text-chart.scss',
})
export class AppTextChartPanel {
  @Element() el: HTMLElement;

  @Prop()
  selectedElement: HTMLElement;

  @State()
  private fontSize: FontSize | undefined;

  @State()
  private fontFamily: string | undefined;

  @State()
  private fonts: GoogleFont[];

  @State()
  private chartType: SlideChartType = undefined;

  @State()
  private chartSvgContainer: ShadowRoot;

  @State()
  private axisX: SVGAElement;

  @State()
  private axisY: SVGAElement;

  @Event() textChange: EventEmitter<void>;

  private fontsService: FontsService;

  constructor() {
    this.fontsService = FontsService.getInstance();
  }

  async componentWillLoad() {
    this.chartType = await ChartUtils.initSlideChartType(this.selectedElement);
    await this.findAxisElement();
    this.fontSize = await this.initFontSize(this.selectedElement);
    this.fonts = await this.fontsService.loadAllGoogleFonts();
    this.fontFamily = await this.initFontFamily(this.selectedElement);
  }

  private async findAxisElement() {
    if (!this.selectedElement) {
      return;
    }

    const chartSvgContainer: ShadowRoot =
      this.selectedElement.shadowRoot.querySelector(
        `deckgo-custom-${this.chartType}-chart`
      ).shadowRoot;
    this.axisX = chartSvgContainer.querySelector('.axis-x');
    this.axisY = chartSvgContainer.querySelector('.axis-y');
    this.chartSvgContainer = chartSvgContainer;
  }

  private initFontSize(element: HTMLElement): FontSize {
    if (!element) {
      return FontSize.NORMAL;
    }

    const fontSize = this.selectedElement.style.getPropertyValue(
      '--deckgo-chart-text-font-size'
    );

    return this.findFontSize(fontSize);
  }

  private initFontFamily(element: HTMLElement): string | undefined {
    if (!element) {
      return undefined;
    }

    const selectedFont = this.selectedElement.style.getPropertyValue(
      '--deckgo-chart-text-font-family'
    );
    return selectedFont &&
      selectedFont !== 'san-serif' &&
      selectedFont !== 'serif'
      ? selectedFont
      : undefined;
  }

  private findFontSize(fontSizeString: string): FontSize {
    if (!fontSizeString || fontSizeString === '' || fontSizeString === '10px') {
      return FontSize.NORMAL;
    }

    if (fontSizeString === '8px') {
      return FontSize.SMALL;
    }

    if (fontSizeString === '6px') {
      return FontSize.VERY_SMALL;
    }

    if (fontSizeString === '14px') {
      return FontSize.BIG;
    }

    if (fontSizeString === '18px') {
      return FontSize.VERY_BIG;
    }

    return FontSize.CUSTOM;
  }

  private async changeFontSize($event: CustomEvent) {
    if (!$event || !$event.detail) {
      return;
    }

    this.fontSize = $event.detail.value;
    const fontSize: string =
      this.fontSize === FontSize.CUSTOM ? '10' : FontSizeValue[this.fontSize];
    this.selectedElement.style.setProperty(
      '--deckgo-chart-text-font-size',
      `${fontSize}px`
    );
    this.textChange.emit();
  }

  private async changeFontFamily(font: GoogleFont) {
    this.fontFamily = font.family.replace(/\'/g, '').replace(/\"/g, '');

    this.selectedElement.style.setProperty(
      '--deckgo-chart-text-font-family',
      font.family.replace(/\'/g, '').replace(/\"/g, '')
    );
    this.textChange.emit();
  }

  render() {
    return (
      <app-expansion-panel>
        <ion-label slot='title'>{i18n.state.editor.text}</ion-label>

        <ion-list>
          <ion-item-divider class='ion-padding-top'>
            <ion-label>{i18n.state.editor.scale}</ion-label>
          </ion-item-divider>

          <ion-item class='select'>
            <ion-label>{i18n.state.editor.scale}</ion-label>

            <ion-select
              value={this.fontSize}
              placeholder={i18n.state.editor.select_font_size}
              onIonChange={(e: CustomEvent) => this.changeFontSize(e)}
              interface='popover'
              mode='md'
              class='ion-padding-start ion-padding-end'>
              {this.renderFontSizeOptions()}
            </ion-select>
          </ion-item>

          <ion-item-divider class='ion-padding-top'>
            <ion-label>{i18n.state.editor.font}</ion-label>
          </ion-item-divider>

          <ion-item class='select'>
            <ion-label>{i18n.state.editor.series}</ion-label>

            <div class='container ion-margin-bottom'>
              {this.renderDefaultFont(this.fontFamily === undefined)}
              {this.renderGoogleFonts()}
            </div>
          </ion-item>
        </ion-list>
      </app-expansion-panel>
    );
  }

  private renderFontSizeOptions() {
    const options = [
      <ion-select-option value={FontSize.VERY_SMALL}>
        {i18n.state.editor.very_small}
      </ion-select-option>,
      <ion-select-option value={FontSize.SMALL}>
        {i18n.state.editor.small}
      </ion-select-option>,
      <ion-select-option value={FontSize.NORMAL}>
        {i18n.state.editor.normal}
      </ion-select-option>,
      <ion-select-option value={FontSize.BIG}>
        {i18n.state.editor.big}
      </ion-select-option>,
      <ion-select-option value={FontSize.VERY_BIG}>
        {i18n.state.editor.very_big}
      </ion-select-option>,
      this.fontSize === FontSize.CUSTOM ? (
        <ion-select-option value={FontSize.CUSTOM}>
          {i18n.state.editor.custom}
        </ion-select-option>
      ) : undefined,
    ];
    return options;
  }

  private renderGoogleFonts() {
    if (this.fonts === undefined) {
      return undefined;
    }

    return this.fonts.map((font: GoogleFont) => {
      return this.renderFont(
        font,
        this.fontFamily === font.family.replace(/\'/g, '').replace(/\"/g, '')
      );
    });
  }

  private renderDefaultFont(selected: boolean) {
    return (
      <div
        class={`item ${selected ? 'selected' : ''}`}
        custom-tappable
        onClick={() => this.changeFontFamily(null)}>
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
        onClick={() => this.changeFontFamily(font)}>
        <deckgo-slide-title class='showcase'>
          <p slot='title' style={{ 'font-family': font.family }}>
            {font.name}
          </p>
        </deckgo-slide-title>
      </div>
    );
  }
}
