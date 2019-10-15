import { TextManager } from './TextManager';
import { setupMockjax } from './utils'
import './styles.css';

let textManager;

window.onload = () => {
    textManager = new TextManager('textContainer', 'buttonsContainer');
    textManager.render();
    setupMockjax();

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
        textManager.handleKeyPress(event, event.which || event.keyCode)
    }

    window.onkeydown = (event) => {
        textManager.handleKeyDown(event, event.which || event.keyCode);
    }

    window.onmousemove = () => {
        textManager.enableMouse();
    }

    window.onSearch = (event) => {
        textManager.search(event.target.value);
        event.stopPropagation();
    }
}