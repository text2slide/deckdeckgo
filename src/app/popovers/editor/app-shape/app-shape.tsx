import {
	Component,
	Element,
	h,
	Prop,
	Event,
	EventEmitter,
} from '@stencil/core';

import assetsStore from '../../../stores/assets.store';
import i18n from '../../../stores/i18n.store';

import { EnvironmentDeckDeckGoConfig } from '../../../types/core/environment-config';
import { EnvironmentConfigService } from '../../../services/environment/environment-config.service';
import { ShapeHelper } from '../../../helpers/editor/shape.helper';

@Component({
	tag: 'app-shape',
	styleUrl: 'app-shape.scss',
})
export class AppShape {
	@Element() el: HTMLElement;

	@Prop()
	selectedElement: HTMLElement;

	@Event() private slideDidChange: EventEmitter<HTMLElement>;

	private shapeHelper: ShapeHelper;

	private config: EnvironmentDeckDeckGoConfig =
		EnvironmentConfigService.getInstance().get('deckdeckgo');

	async componentWillLoad() {
		this.shapeHelper = new ShapeHelper(this.slideDidChange);
	}

	private async closePopoverWithoutResults() {
		await (this.el.closest('ion-popover') as HTMLIonPopoverElement).dismiss();
	}

	private async selectShape(src: string, label: string) {
		const lazyImgElement: HTMLElement = this.el.querySelector(
			`deckgo-lazy-img[svg-src='${src}']`
		);
		const ratio: number =
			lazyImgElement && lazyImgElement.parentElement
				? lazyImgElement.parentElement.getBoundingClientRect().height /
				  lazyImgElement.parentElement.getBoundingClientRect().width
				: 1;

		await (this.el.closest('ion-popover') as HTMLIonPopoverElement).dismiss({
			svg: {
				src,
				label,
				ratio,
			},
		});
	}

	private async selectLine(label: string) {
		await this.shapeHelper.appendLine(this.selectedElement, label);
	}

	render() {
		return [
			<ion-toolbar>
				<h2>{i18n.state.editor.add_a_shape}</h2>
				<app-close-menu
					slot='end'
					onClose={() => this.closePopoverWithoutResults()}></app-close-menu>
			</ion-toolbar>,
			this.renderShapes(),
		];
	}

	private renderShapes() {
		return (
			<div class='container ion-margin-bottom'>
				<ion-list class='article'>
					<ion-item-divider>
						<ion-label>{i18n.state.editor.lines}</ion-label>
					</ion-item-divider>

					<div class='ion-padding shapes'>
						{this.renderShapesGroup('lines')}
					</div>

					<ion-item-divider>
						<ion-label>{i18n.state.editor.shapes}</ion-label>
					</ion-item-divider>

					<div class='ion-padding shapes'>
						{this.renderShapesGroup('shapes')}
					</div>

					<ion-item-divider>
						<ion-label>{i18n.state.editor.arrows}</ion-label>
					</ion-item-divider>

					<div class='ion-padding shapes'>
						{this.renderShapesGroup('arrows')}
					</div>

					{/* <ion-item-divider>
            <ion-label>{i18n.state.editor.status}</ion-label>
          </ion-item-divider> */}

					{/* <div class="ion-padding shapes">{this.renderShapesGroup('status')}</div>

          <ion-item-divider>
            <ion-label>{i18n.state.editor.computers}</ion-label>
          </ion-item-divider>

          <div class="ion-padding shapes">{this.renderShapesGroup('computers')}</div>

          <ion-item-divider>
            <ion-label>{i18n.state.editor.date_time}</ion-label>
          </ion-item-divider>

          <div class="ion-padding shapes">{this.renderShapesGroup('dateTime')}</div>

          <ion-item-divider>
            <ion-label>{i18n.state.editor.files}</ion-label>
          </ion-item-divider>

          <div class="ion-padding shapes">{this.renderShapesGroup('files')}</div>

          <ion-item-divider>
            <ion-label>{i18n.state.editor.finance}</ion-label>
          </ion-item-divider>

          <div class="ion-padding shapes">{this.renderShapesGroup('finance')}</div> */}
				</ion-list>
			</div>
		);
	}

	private renderShapesGroup(group: string) {
		return assetsStore.state.shapes[group].map((asset: ImgAsset) => {
			return this.renderShape(
				`${this.config.globalAssetsUrl}${asset.src}`,
				asset.ariaLabel,
				group
			);
		});
	}

	private renderShape(src: string, ariaLabel: string, group: string) {
		return (
			<div
				custom-tappable
				onClick={() =>
					group == 'lines'
						? this.selectLine(ariaLabel)
						: this.selectShape(src, ariaLabel)
				}>
				<div class='image-container'>
					<img src={src}></img>
				</div>
			</div>
		);
	}
}
