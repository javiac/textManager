import moment from 'moment';
import { createElementWithText } from './utils';

export class TextManager {
    constructor(textContainerId, buttonsContainerId) {
        this.texts = [];
        this.historyIndex = 0;
        this.history = [[]];

        this.init(textContainerId, buttonsContainerId);
    }

    init(textContainerId, buttonsContainerId) {
        this.textContainer = document.getElementById(textContainerId);
        if (!this.textContainer) {
            throw new Error(`${id} not found`);
        }

        this.buttonsContainer = document.getElementById(buttonsContainerId);
        if (!this.buttonsContainer) {
            throw new Error(`${id} not found`);
        }

        const buttons = this.buttonsContainer.getElementsByTagName('button');
        this.buttonRemove = buttons[1];
        this.buttonUndo = buttons[2];
        this.buttonRedo = buttons[3];

        this.updateButtons();
        this.restoreFromLocalStorage();
        this.saveHistory();
    }

    addText() {
        const text = prompt("Please enter a new text", "My new text");
        if (text) {
            this.texts.push({
                id: uuidv4(),
                value: text,
                selected: false,
                createdAt: moment().format('MMMM Do YYYY, HH:mm:ss')
            })

            this.saveHistory();
            this.saveLocalStorage();
            this.redraw();
        }
    }

    selectText(id) {
        const text = this.texts.find(text => text.id === id);
        if (text) {
            text.selected = !text.selected;
        }
        this.redraw();
    }

    removeSelectedTexts() {
        this.texts = this.texts.filter(text => !text.selected);
        this.saveHistory();
        this.saveLocalStorage();
        this.redraw();
    }

    undo() {
        if (this.historyIndex - 1 >= 0) {
            this.historyIndex--;
            this.texts = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.saveLocalStorage();
            this.redraw();
        }
    }

    redo() {
        const texts = this.history[this.historyIndex + 1];
        if (texts) {
            this.historyIndex++;
            this.texts = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
            this.saveLocalStorage();
            this.redraw();
        }
    }

    saveHistory() {
        const textsCopy = JSON.parse(JSON.stringify(this.texts));

        if (this.historyIndex === 0) {
            this.history.splice(this.historyIndex + 1, this.history.length - (this.historyIndex + 1));
            this.history.push(textsCopy);
            this.historyIndex = this.history.length - 1;
        } else if (this.historyIndex !== this.history.length - 1) {
            this.history[this.historyIndex + 1] = textsCopy;
            this.historyIndex++;
            this.history.splice(this.historyIndex + 2, this.history.length - (this.historyIndex + 2));
        } else {
            this.history.push(textsCopy);
            this.historyIndex = this.history.length - 1;
        }
    }

    removeText(id) {
        const index = this.texts.map(text => text.id).indexOf(id);
        if (index !== -1) {
            this.texts.splice(index, 1);
        }
        this.saveHistory();
        this.saveLocalStorage();
        this.redraw();
    }

    resetMock() {
        $.getJSON("/demoTexts", (response) => {
            if (response.status == "success") {
                this.texts = response.data;
                this.saveHistory();
                this.saveLocalStorage();
                this.redraw();
            } else {
                throw new Error('Mock failed');
            }
        });
    }

    /** Items will be avilable after reloading the page */
    saveLocalStorage() {
        const textsToSave = JSON.stringify(this.texts.map(text => { return { ...text, highlighted: undefined, selected: undefined } }))
        window.localStorage.setItem('texts', textsToSave)
    }

    restoreFromLocalStorage() {
        const texts = window.localStorage.getItem('texts');
        if (texts) {
            this.texts = JSON.parse(texts);
        }
    }

    redraw() {
        const textElements = this.textContainer.getElementsByClassName('text-item');

        // Remove elements from the view
        for (const element of Array.from(textElements)) {
            const text = this.texts.find(item => item.id === element.id);
            if (text) {
                this.checkElementClass('selected', text, element);
                this.checkElementClass('highlighted', text, element);
            } else {
                element.remove();
            }
        }

        // Insert new elements in the view
        const textElementsIds = Array.from(textElements).map(item => item.id);
        for (let i = 0; i < this.texts.length; i++) {
            if (!textElementsIds.includes(this.texts[i].id)) {
                const textItem = document.createElement('div');
                textItem.id = this.texts[i].id;
                textItem.className = `text-item${this.texts[i].selected ? ' selected' : ''}${this.texts[i].highlighted ? ' highlighted' : ''}`;

                textItem.addEventListener('click', () => this.selectText(textItem.id))
                textItem.addEventListener('dblclick', () => this.removeText(textItem.id))
                textItem.addEventListener('mouseenter', () => this.setHighlighted(textItem))

                const textPart = createElementWithText('div', this.texts[i].value);
                textItem.appendChild(textPart);
                const datePart = createElementWithText('div', this.texts[i].createdAt || '');
                textItem.appendChild(datePart);

                const childInSamePosition = this.textContainer.childNodes[textElementsIds.length - 1 - i];
                if (childInSamePosition) {
                    childInSamePosition.insertAdjacentElement('afterend', textItem);
                } else {
                    this.textContainer.prepend(textItem);
                }
            }
        }

        this.adjustScroll();
        this.updateButtons()
    }

    updateButtons() {
        if (this.texts.filter(text => text.selected).length > 0) {
            this.buttonRemove.disabled = false;
        } else {
            this.buttonRemove.disabled = true;
        }

        if (this.historyIndex === 0) {
            this.buttonUndo.disabled = true;
        } else {
            this.buttonUndo.disabled = false;
        }

        if (this.historyIndex === this.history.length - 1) {
            this.buttonRedo.disabled = true;
        } else {
            this.buttonRedo.disabled = false;
        }
    }

    handleKeyPress(keyCode) {
        console.log(keyCode);
        this.keyboardActive = true;
        switch (keyCode) {
            case 97:
                this.addText();
                break;
            case 117:
                this.undo();
                break;
            case 114:
                this.redo();
                break;

        }
    }

    handleKeyDown(keyCode) {
        console.log(keyCode);
        this.keyboardActive = true;
        switch (keyCode) {
            case 38:
                this.moveHighlighted('up');
                break;
            case 40:
                this.moveHighlighted('down');
                break;
        }
    }

    setHighlighted(textItem) {
        if (!this.keyboardActive) {
            this.texts = this.texts.map(text => { return { ...text, highlighted: false } })
            const text = this.texts.find(text => text.id === textItem.id);
            text.highlighted = true;
            this.redraw();
        }
    }

    checkElementClass(className, textModel, textElement) {
        if (textModel[className] && !$(textElement).hasClass(className)) {
            $(textElement).addClass(className);
        } else if (!textModel[className] && $(textElement).hasClass(className)) {
            $(textElement).removeClass(className);
        }
    }

    moveHighlighted(direction) {
        if (this.texts.length > 0) {

            const currentHighlightedIndex = this.texts.map(text => text.highlighted).indexOf(true);
            let indexToHighlight;
            if (currentHighlightedIndex === -1) {
                indexToHighlight = this.texts.length - 1;
            } else {
                if (direction === 'down') {
                    indexToHighlight = Math.max(currentHighlightedIndex - 1, 0);
                } else {
                    indexToHighlight = Math.min(currentHighlightedIndex + 1, this.texts.length - 1);
                }
            }

            this.texts = this.texts.map(text => { return { ...text, highlighted: false } });
            this.texts[indexToHighlight].highlighted = true;
            this.redraw();
        }
    }

    adjustScroll() {
        const element = $('.highlighted')[0];

        if (element) {
            const elementPositions = element.getBoundingClientRect();
            const containerPositions = this.textContainer.getBoundingClientRect();

            // Highlighted element overflows at bottom
            if (elementPositions.bottom > containerPositions.bottom) {
                this.textContainer.scrollTop += elementPositions.bottom - containerPositions.bottom;
            }
            // Element overflows at top
            else if (elementPositions.top < containerPositions.top) {
                this.textContainer.scrollTop -= containerPositions.top - elementPositions.top;
            }
        }
    }

    enableMouse() {
        this.keyboardActive = false;
    }
}