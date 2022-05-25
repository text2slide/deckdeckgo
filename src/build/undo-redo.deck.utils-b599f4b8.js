import { u as undoRedoStore } from './undo-redo.store-3caf8fbd.js';

const setAttribute = (target, { attribute, value, updateUI }) => {
  if (!undoRedoStore.state.undo) {
    undoRedoStore.state.undo = [];
  }
  undoRedoStore.state.undo.push({
    type: 'attribute',
    target,
    data: {
      attribute,
      value: target.getAttribute(attribute),
      updateUI,
    },
  });
  undoRedoStore.state.redo = [];
  target.setAttribute(attribute, value);
  updateUI(value);
};
const setStyle = (target, { properties, type, updateUI, }) => {
  if (!undoRedoStore.state.undo) {
    undoRedoStore.state.undo = [];
  }
  undoRedoStore.state.undo.push({
    type: 'style',
    target,
    data: {
      value: target.getAttribute('style'),
      type,
      updateUI,
    },
  });
  undoRedoStore.state.redo = [];
  properties.forEach(({ property, value }) => {
    if (value === null) {
      target.style.removeProperty(property);
      return;
    }
    target.style.setProperty(property, value);
  });
};
const undo = async ($event) => {
  console.log('calling undo');
  const result = await undoRedo({
    from: undoRedoStore.state.undo,
    to: undoRedoStore.state.redo,
    $event,
  });
  console.log('calling undo event: ', $event.composedPath());
  console.log('undo result: ', result);
  if (!result) {
    return;
  }
  const { from } = result;
  undoRedoStore.state.undo = from;
};
const redo = async ($event) => {
  console.log('calling redo');
  const result = await undoRedo({
    from: undoRedoStore.state.redo,
    to: undoRedoStore.state.undo,
    $event,
  });
  if (!result) {
    return;
  }
  const { from } = result;
  undoRedoStore.state.redo = from;
};
const undoRedo = async ({ $event, from, to, }) => {
  console.log('undo redo check');
  console.log({ from });
  console.log({ to });
  console.log({ $event });
  console.log('undoRedoStore.state.elementInnerHTML: ', undoRedoStore.state.elementInnerHTML);
  if (undoRedoStore.state.elementInnerHTML !== undefined) {
    return undefined;
  }
  if (from === undefined || to === undefined) {
    return undefined;
  }
  $event.preventDefault();
  const undoChange = from[from.length - 1];
  console.log({ undoChange });
  if (!undoChange) {
    return undefined;
  }
  const { type, data, target } = undoChange;
  // In case of decks, we are using HTMLElement only
  const element = target;
  if (type === 'input') {
    to?.push({ type, target, data: { innerHTML: element.innerHTML } });
    undoRedoElement(element, data);
  }
  if (type === 'style') {
    to?.push({
      type,
      target,
      data: {
        ...data,
        value: element.getAttribute('style'),
      },
    });
    await undoRedoSetStyle(element, data);
  }
  if (type === 'attribute') {
    const { attribute } = data;
    to?.push({
      type,
      target,
      data: {
        ...data,
        value: element.getAttribute(attribute),
      },
    });
    undoRedoSetAttribute(element, data);
  }
  return {
    from: [...from.slice(0, from?.length - 1)],
  };
};
const undoRedoElement = (target, { innerHTML }) => {
  target.innerHTML = innerHTML;
  emitDidUpdate({ target: target.parentElement, eventName: 'slideDidChange' });
};
const undoRedoSetStyle = async (target, { value, type, updateUI }) => {
  target.setAttribute('style', value);
  if (type === 'deck') {
    emitDidUpdate({ target, eventName: 'deckDidChange' });
  }
  else if (type === 'slide') {
    emitDidUpdate({ target, eventName: 'slideDidChange' });
  }
  else {
    emitDidUpdate({
      target: target.parentElement,
      eventName: 'slideDidChange',
    });
  }
  await updateUI(value);
};
const undoRedoSetAttribute = (target, { attribute, value, updateUI }) => {
  target.setAttribute(attribute, value);
  emitDidUpdate({ target, eventName: 'deckDidChange' });
  updateUI(value);
};
const emitDidUpdate = ({ eventName, target, }) => {
  const didUpdate = new CustomEvent(eventName, {
    bubbles: true,
    detail: target,
  });
  target.dispatchEvent(didUpdate);
};

export { setAttribute as a, redo as r, setStyle as s, undo as u };
