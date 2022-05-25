import { i as i18n } from './i18n.store-9e527fdc.js';
import { c as createStore } from './index-74a8356e.js';
import { e as editorStore } from './editor.store-8ac9843f.js';
import { u as userStore } from './user.store-a1b75c69.js';
import { i as i18nFormat } from './i18n.utils-546d3394.js';

const { state, onChange, reset } = createStore({
  share: null
});
const shareStore = { state, onChange, reset };

const share = () => {
  const title = editorStore.state.doc !== null
    ? editorStore.state.doc.data.meta?.title ?? i18n.state.share.a_document
    : editorStore.state.deck.data.meta?.title ?? i18n.state.share.a_presentation;
  shareStore.state.share = {
    title,
    userName: userStore.state.name,
    userSocial: userStore.state.social
  };
};
const getShareText = () => getCommonShareText();
const getShareTwitterText = () => {
  const { title, userSocial } = shareStore.state.share;
  if (!userSocial || userSocial === undefined || !userSocial.twitter || userSocial.twitter === undefined || userSocial.twitter === '') {
    return getCommonShareText();
  }
  return i18nFormat(i18n.state.share.content_by, [
    { placeholder: '{0}', value: `${title}` },
    { placeholder: '{1}', value: `@${userSocial.twitter}` },
    { placeholder: '{2}', value: `@deckdeckgo` }
  ]);
};
// i18n.state.share.a_presentation
const getCommonShareText = () => {
  const { userName, title } = shareStore.state.share;
  const deckDeckGo = 'DeckDeckGo';
  if (userName && userName !== undefined && userName !== '') {
    return i18nFormat(i18n.state.share.content_by, [
      { placeholder: '{0}', value: `${title}` },
      { placeholder: '{1}', value: `${userName}` },
      { placeholder: '{2}', value: `${deckDeckGo}` }
    ]);
  }
  return i18nFormat(i18n.state.share.content_no_author, [
    { placeholder: '{0}', value: `${title}` },
    { placeholder: '{1}', value: `${deckDeckGo}` }
  ]);
};

export { shareStore as a, getShareTwitterText as b, getShareText as g, share as s };
