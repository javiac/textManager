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
    const text = prompt("Please enter a new text", "My new text");

    if (text) {
        textManager.addText(text);
    }
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