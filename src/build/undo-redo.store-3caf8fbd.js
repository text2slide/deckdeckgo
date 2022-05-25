import { c as createStore } from './index-74a8356e.js';

const { state, onChange, reset } = createStore({
  undo: undefined,
  redo: undefined,
  observe: true,
  elementInnerHTML: undefined,
});
const undoRedoStore = { state, onChange, reset };

export { undoRedoStore as u };
