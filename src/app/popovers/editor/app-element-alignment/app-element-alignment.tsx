import {
	Component,
	Element,
	Event,
	EventEmitter,
	Host,
	h,
	Prop,
} from '@stencil/core';

import { AppIcon } from '../../../components/core/app-icon/app-icon';

import i18n from '../../../stores/i18n.store';

import { SelectedElement } from '../../../types/editor/selected-element';

enum AlignHorizontal {
	LEFT = 'left',
	CENTER = 'center',
	RIGHT = 'right',
}

enum AlignVertical {
	TOP = 'top',
	MIDDLE = 'middle',
	BOTTOM = 'bottom',
}

@Component({
	tag: 'app-element-alignment',
	styleUrl: 'app-element-alignment.scss',
})
export class AppElementStyle {
	@Element() el: HTMLElement;

	@Prop()
	selectedElement: SelectedElement;

	@Event() elementDidMoved: EventEmitter<void>;

	private container: HTMLElement;
	private element: HTMLElement;
	private elementBounding: DOMRect;
	private containerBounding: DOMRect;
	private originWidth: number;
	private originHeight: number;
	private eventDrrTextDidMoved: CustomEvent<HTMLElement>;

	async componentWillLoad() {
		this.element = this.selectedElement.element;
		this.container = this.element.parentElement.shadowRoot.querySelector(
			'.deckgo-aspect-ratio-content'
		);
		this.eventDrrTextDidMoved = new CustomEvent<HTMLElement>('drrTextDidMoved', {
			bubbles: true,
			detail: this.element,
		});
	}

	private async closePopover() {
		await (this.el.closest('ion-popover') as HTMLIonPopoverElement).dismiss();
	}

	private emitDrrTextDidMoved() {
		this.element.dispatchEvent(this.eventDrrTextDidMoved);
	}

	private emitStyleChange() {
		this.elementDidMoved.emit();
	}

	private initBoungingParam() {
		this.elementBounding = this.element.getClientRects()[0];
		this.containerBounding = this.container.getClientRects()[0];
		this.originWidth = this.element.offsetWidth;
		this.originHeight = this.element.offsetHeight;
	}

	private alignElement(alignments: string) {
		this.initBoungingParam();

		alignments.split(' ').map((alignment: AlignHorizontal | AlignVertical) => {
			this.applyAlignment(alignment);
		});

		this.emitDrrTextDidMoved();
		this.emitStyleChange();
	}

	private applyAlignment(alignment: AlignHorizontal | AlignVertical) {
		if (Object.values(AlignHorizontal).includes(alignment as AlignHorizontal)) {
			this.applyAlignment_horizontal(alignment as AlignHorizontal);
		} else {
			this.applyAlignment_vertical(alignment as AlignVertical);
		}
	}

	private applyAlignment_horizontal(alignment: AlignHorizontal) {
		const restWidth = this.elementBounding.width - this.originWidth;
		var left: number | null = null;
		switch (alignment) {
			case AlignHorizontal.LEFT:
				left = (0 + restWidth) / 2;
				break;
			case AlignHorizontal.CENTER:
				left = (this.containerBounding.width - this.originWidth) / 2;
				break;
			case AlignHorizontal.RIGHT:
				left = this.containerBounding.width - this.originWidth - restWidth / 2;
				break;
		}

		this.element.style.setProperty(
			'--left',
			`${(left / this.containerBounding.width) * 100}%`
		);
	}

	private applyAlignment_vertical(alignment: AlignVertical) {
		const restHeight = this.elementBounding.height - this.originHeight;
		var top: number | null = null;
		switch (alignment) {
			case AlignVertical.TOP:
				top = (0 + restHeight) / 2;
				break;
			case AlignVertical.MIDDLE:
				top = (this.containerBounding.height - this.originHeight) / 2;
				break;
			case AlignVertical.BOTTOM:
				top = this.containerBounding.height - this.originHeight - restHeight / 2;
				break;
		}

		this.element.style.setProperty(
			'--top',
			`${(top / this.containerBounding.height) * 100}%`
		);
	}

	render() {
		return (
			<Host>
				<ion-toolbar>
					<h2>{i18n.state.editor.alignment}</h2>
					<app-close-menu
						slot='end'
						onClose={() => this.closePopover()}></app-close-menu>
				</ion-toolbar>
				{this.renderAlignmentOptions()}
			</Host>
		);
	}

	private renderAlignmentOptions() {
		const alignments = ['top', 'middle', 'bottom', 'left', 'center', 'right'];

		return alignments.map((alignment) => {
			const positionName = alignment
				.split(' ')
				.map((position) => {
					return i18n.state.editor[position];
				})
				.join('/');
			return (
				<ion-button size='small' onClick={() => this.alignElement(alignment)}>
					<AppIcon
						name={`align_${alignment}`}
						ariaLabel=''
						ariaHidden={true}></AppIcon>
					{positionName}
				</ion-button>
			);
		});
	}
}
