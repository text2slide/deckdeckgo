import { s as setStyle } from './undo-redo.deck.utils-560a9639.js';
import { D as DeckdeckgoInlineEditorUtils } from './utils-c0fb26ca.js';

async function execCommandList(selection, action) {
  const anchorNode = selection.anchorNode;
  if (!anchorNode) {
    return;
  }
  const container = anchorNode.nodeType !== Node.TEXT_NODE && anchorNode.nodeType !== Node.COMMENT_NODE ? anchorNode : anchorNode.parentElement;
  const range = selection.getRangeAt(0);
  // Did the user select the all list
  if (range.commonAncestorContainer && range.commonAncestorContainer.nodeName.toLowerCase() === action.type) {
    await removeList(range);
    return;
  }
  // Did the user select an element of the list
  if (container.nodeName.toLowerCase() === 'li') {
    await removeItem(container, range, selection, action.type);
    return;
  }
  // Create a brand new list
  await createList(container, range, selection, action.type);
}
async function createList(container, range, selection, type) {
  const fragment = range.extractContents();
  const list = document.createElement(type);
  const li = document.createElement('li');
  li.style.cssText = container.style.cssText;
  li.appendChild(fragment);
  list.appendChild(li);
  range.insertNode(list);
  selection.selectAllChildren(list);
}
async function removeList(range) {
  const list = range.commonAncestorContainer;
  if (list.hasChildNodes()) {
    Array.from(list.childNodes).forEach((child) => {
      if (child.hasChildNodes() &&
        child.childNodes.length > 1 &&
        child.firstChild.nodeType !== Node.TEXT_NODE &&
        child.firstChild.nodeType !== Node.COMMENT_NODE) {
        const span = document.createElement('span');
        span.append(...Array.from(child.childNodes));
        list.parentElement.insertBefore(span, list);
      }
      else {
        const text = document.createTextNode(child.textContent);
        list.parentElement.insertBefore(text, list);
      }
    });
  }
  list.parentElement.removeChild(list);
}
async function removeItem(container, range, selection, type) {
  movePreviousSiblings(container, type);
  moveNextSiblings(container, type);
  // Finally convert selected item to not be part of the list anymore
  const span = document.createElement('span');
  span.style.cssText = container.style.cssText;
  const fragment = range.extractContents();
  span.appendChild(fragment);
  container.parentElement.parentElement.insertBefore(span, container.parentElement.nextElementSibling ? container.parentElement.nextElementSibling : container.parentElement.parentElement.lastChild);
  selection.selectAllChildren(container);
  const list = container.parentElement;
  list.removeChild(container);
  if (!list.hasChildNodes()) {
    list.parentElement.removeChild(list);
  }
}
function movePreviousSiblings(container, type) {
  if (container.previousElementSibling && container.previousElementSibling.nodeName.toLowerCase() === 'li') {
    const list = moveSibling(container.previousElementSibling, true, type);
    if (list) {
      container.parentElement.parentElement.insertBefore(list, container.parentElement);
    }
  }
}
function moveNextSiblings(container, type) {
  if (container.nextElementSibling && container.nextElementSibling.nodeName.toLowerCase() === 'li') {
    const list = moveSibling(container.nextElementSibling, false, type);
    if (list) {
      container.parentElement.nextSibling
        ? container.parentElement.parentElement.insertBefore(list, container.parentElement.nextSibling)
        : container.parentElement.parentElement.appendChild(list);
    }
  }
}
function moveSibling(sibling, previous, type) {
  if (!sibling || sibling.nodeName.toLowerCase() !== 'li') {
    return null;
  }
  const children = [];
  while (sibling && sibling.nodeName.toLowerCase() === 'li') {
    children.push(sibling);
    sibling = previous ? sibling.previousElementSibling : sibling.nextElementSibling;
  }
  if (!children || children.length <= 0) {
    return null;
  }
  const list = document.createElement(type);
  if (previous) {
    list.append(...children.reverse());
  }
  else {
    list.append(...children);
  }
  return list;
}

async function execCommandStyle(selection, action, containers) {
  console.log('execCommandStyle: ', { selection }, { action }, { containers });
  const anchorNode = selection.anchorNode;
  if (!anchorNode) {
    return;
  }
  if (action.style === 'font-family') {
    setStyle(anchorNode, {
      properties: [{ value: action.value || null, property: 'font-family' }],
      type: 'element',
      updateUI: async () => await new Promise(() => { }),
    });
  }
  const container = anchorNode.nodeType !== Node.TEXT_NODE &&
    anchorNode.nodeType !== Node.COMMENT_NODE
    ? anchorNode
    : anchorNode.parentElement;
  const sameSelection = container && container.innerText === selection.toString();
  if (sameSelection &&
    !DeckdeckgoInlineEditorUtils.isContainer(containers, container) &&
    container.style[action.style] !== undefined) {
    await updateSelection(container, action, containers);
    return;
  }
  await replaceSelection(container, action, selection, containers);
}
async function updateSelection(container, action, containers) {
  container.style[action.style] = await getStyleValue(container, action, containers);
  await cleanChildren(action, container);
}
async function replaceSelection(container, action, selection, containers) {
  const range = selection.getRangeAt(0);
  // User selected a all list?
  if (range.commonAncestorContainer &&
    ['ol', 'ul', 'dl'].some((listType) => listType === range.commonAncestorContainer.nodeName.toLowerCase())) {
    await updateSelection(range.commonAncestorContainer, action, containers);
    return;
  }
  const fragment = range.extractContents();
  const span = await createSpan(container, action, containers);
  span.appendChild(fragment);
  await cleanChildren(action, span);
  await flattenChildren(action, span);
  range.insertNode(span);
  selection.selectAllChildren(span);
}
async function cleanChildren(action, span) {
  if (!span.hasChildNodes()) {
    return;
  }
  // Clean direct (> *) children with same style
  const children = Array.from(span.children).filter((element) => {
    return (element.style[action.style] !== undefined &&
      element.style[action.style] !== '');
  });
  if (children && children.length > 0) {
    children.forEach((element) => {
      element.style[action.style] = '';
      if (element.getAttribute('style') === '' || element.style === null) {
        element.removeAttribute('style');
      }
    });
  }
  // Direct children (> *) may have children (*) which need to be cleaned too
  const cleanChildrenChildren = Array.from(span.children).map((element) => {
    return cleanChildren(action, element);
  });
  if (!cleanChildrenChildren || cleanChildrenChildren.length <= 0) {
    return;
  }
  await Promise.all(cleanChildrenChildren);
}
async function createSpan(container, action, containers) {
  const span = document.createElement('span');
  span.style[action.style] = await getStyleValue(container, action, containers);
  return span;
}
// We assume that if the same style is applied, user want actually to remove it (same behavior as in MS Word)
// Note: initial may have no effect on the background-color
async function getStyleValue(container, action, containers) {
  if (!container) {
    return action.value;
  }
  if (await action.initial(container)) {
    return 'initial';
  }
  const style = await findStyleNode(container, action.style, containers);
  if (await action.initial(style)) {
    return 'initial';
  }
  return action.value;
}
async function findStyleNode(node, style, containers) {
  // Just in case
  if (node.nodeName.toUpperCase() === 'HTML' ||
    node.nodeName.toUpperCase() === 'BODY') {
    return null;
  }
  if (!node.parentNode) {
    return null;
  }
  if (DeckdeckgoInlineEditorUtils.isContainer(containers, node)) {
    return null;
  }
  const hasStyle = node.style[style] !== null &&
    node.style[style] !== undefined &&
    node.style[style] !== '';
  if (hasStyle) {
    return node;
  }
  return await findStyleNode(node.parentNode, style, containers);
}
// We try to not keep <span/> in the tree if we can use text
async function flattenChildren(action, span) {
  if (!span.hasChildNodes()) {
    return;
  }
  // Flatten direct (> *) children with no style
  const children = Array.from(span.children).filter((element) => {
    const style = element.getAttribute('style');
    return !style || style === '';
  });
  if (children && children.length > 0) {
    children.forEach((element) => {
      // Can only be flattened if there is no other style applied to a children, like a color to part of a text with a background
      const styledChildren = element.querySelectorAll('[style]');
      if (!styledChildren || styledChildren.length === 0) {
        const text = document.createTextNode(element.textContent);
        element.parentElement.replaceChild(text, element);
      }
    });
    return;
  }
  // Direct children (> *) may have children (*) which need to be flattened too
  const flattenChildrenChildren = Array.from(span.children).map((element) => {
    return flattenChildren(action, element);
  });
  if (!flattenChildrenChildren || flattenChildrenChildren.length <= 0) {
    return;
  }
  await Promise.all(flattenChildrenChildren);
}

async function execCommand(selection, action, containers) {
  console.log('execCommand: ', { selection, action, containers });
  if (!document || !selection) {
    return;
  }
  if (action.cmd === 'style') {
    await execCommandStyle(selection, action.detail, containers);
  }
  else if (action.cmd === 'list') {
    await execCommandList(selection, action.detail);
  }
}

export { execCommand as e };
