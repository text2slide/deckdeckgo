import { j as h } from './index-b2006fe6.js';
import { i as i18n } from './i18n.store-9e527fdc.js';
import { r as renderI18n } from './i18n.utils-546d3394.js';
import { s as signIn } from './signin.utils-0b38b742.js';

const AppAnonymousContent = ({ title, text }) => {
  const renderNotLoggedInContent = () => {
    return renderI18n(text, {
      placeholder: '{0}',
      value: (h("button", { type: "button", class: "app-button", onClick: () => signIn() }, i18n.state.nav.sign_in))
    });
  };
  return (h("main", { class: "ion-padding fit" },
    h("h1", null, title),
    renderNotLoggedInContent()));
};

export { AppAnonymousContent as A };
