import { TextManager } from './TextManager';
import { setupMockjax } from './utils'
import './styles.css';

let textManager;

window.onload = () => {
    textManager = new TextManager('textContainer', 'buttonsContainer');
    textManager.redraw();
    setupMockjax();
}

window.onAdd = () => {
    textManager.addText();
}

window.onRemove = () => {
    textManager.removeSelectedTexts();
}

window.onUndo = () => {
    textManager.undo();
}

window.onRedo = () => {
    textManager.redo();
}

window.onResetMock = () => {
    textManager.resetMock();
}

window.onkeypress = (event) => {
    textManager.handleKeyPress(event.which || event.keyCode)
}

window.onkeydown = (event) => {
    textManager.handleKeyDown(event.which || event.keyCode);
}

window.onmousemove = () => {
    textManager.enableMouse();
}