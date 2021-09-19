/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface DeckgoSlideSplit {
        "afterSwipe": () => Promise<void>;
        "beforeSwipe": (enter: boolean, reveal: boolean) => Promise<boolean>;
        /**
          * If you provide actions for the all deck but, a specific one for this slide, set this option to true
         */
        "customActions": boolean;
        /**
          * If you define a background for the all deck but, a specific one for this slide, set this option to true
         */
        "customBackground": boolean;
        "hideContent": () => Promise<void>;
        "lazyLoadContent": () => Promise<void>;
        "revealContent": () => Promise<void>;
        /**
          * Set to "demo" if you use such component in one of the start or end section
         */
        "type": 'demo' | 'default';
        /**
          * Split the slide horizontally (false) or vertically (true)
         */
        "vertical": boolean;
    }
}
declare global {
    interface HTMLDeckgoSlideSplitElement extends Components.DeckgoSlideSplit, HTMLStencilElement {
    }
    var HTMLDeckgoSlideSplitElement: {
        prototype: HTMLDeckgoSlideSplitElement;
        new (): HTMLDeckgoSlideSplitElement;
    };
    interface HTMLElementTagNameMap {
        "deckgo-slide-split": HTMLDeckgoSlideSplitElement;
    }
}
declare namespace LocalJSX {
    interface DeckgoSlideSplit {
        /**
          * If you provide actions for the all deck but, a specific one for this slide, set this option to true
         */
        "customActions"?: boolean;
        /**
          * If you define a background for the all deck but, a specific one for this slide, set this option to true
         */
        "customBackground"?: boolean;
        "onSlideDidLoad"?: (event: CustomEvent<void>) => void;
        /**
          * Set to "demo" if you use such component in one of the start or end section
         */
        "type"?: 'demo' | 'default';
        /**
          * Split the slide horizontally (false) or vertically (true)
         */
        "vertical"?: boolean;
    }
    interface IntrinsicElements {
        "deckgo-slide-split": DeckgoSlideSplit;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "deckgo-slide-split": LocalJSX.DeckgoSlideSplit & JSXBase.HTMLAttributes<HTMLDeckgoSlideSplitElement>;
        }
    }
}