import { j as h, F as Fragment } from './index-b2006fe6.js';
import { o as offlineStore } from './offline.store-02c979d4.js';
import { i as i18n } from './i18n.store-9e527fdc.js';
import { E as EditAction } from './edit-action-15b58367.js';
import { t as tenor, u as unsplash } from './environment.utils-29dde5ce.js';

const tenorEnabled = tenor();
const unsplashEnabled = unsplash();
const AppAssetChoice = ({ selectAction }) => {
  const renderStockPhotos = () => {
    if (!offlineStore.state.online) {
      // Unsplash not available offline
      return undefined;
    }
    if (!unsplashEnabled) {
      return undefined;
    }
    return (h("ion-button", { shape: "round", onClick: async () => await selectAction(EditAction.OPEN_UNSPLASH), color: "primary" },
      h("ion-label", null, i18n.state.editor.stock_photo)));
  };
  const renderGif = () => {
    if (!offlineStore.state.online) {
      // Tenor not available offline
      return undefined;
    }
    if (!tenorEnabled) {
      return undefined;
    }
    return (h("ion-button", { shape: "round", onClick: async () => await selectAction(EditAction.OPEN_GIFS), color: "secondary" },
      h("ion-label", null, i18n.state.editor.gif)));
  };
  const renderCustom = () => {
    return (h("ion-button", { shape: "round", onClick: async () => await selectAction(EditAction.OPEN_CUSTOM), color: "tertiary" },
      h("ion-label", null, i18n.state.editor.your_images)));
  };
  return (h(Fragment, null,
    renderStockPhotos(),
    renderGif(),
    renderCustom()));
};

export { AppAssetChoice as A };
