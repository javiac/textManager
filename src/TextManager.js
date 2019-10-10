class TextManager {
    textContainer;
    buttonsContaine;
    texts = [];
    history = [[]];
    historyIndex = 0;
    buttonRemove;
    buttonUndo;
    buttonRedo;

    constructor(textContainerId, buttonsContainerId) {
        this.init(textContainerId, buttonsContainerId);
        this.restoreFromLocalStorage();
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

        this.updateButtons()
    }

    addText(text) {
        this.texts.push({
            id: uuidv4(),
            value: text,
            selected: false
        })

        this.saveHistory();
        this.saveLocalStorage();
        this.redraw();
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
        window.localStorage.setItem('texts', JSON.stringify(this.texts))
    }

    restoreFromLocalStorage() {
        const texts = window.localStorage.getItem('texts');
        if (texts) {
            this.texts = JSON.parse(texts);
        }
    }

    redraw() {
        while (this.textContainer.firstChild) {
            this.textContainer.firstChild.remove();
        }

        for (const text of this.texts) {
            const paragraph = document.createElement("p");
            paragraph.id = text.id;
            paragraph.className = `textItem${text.selected ? ' selected' : ''}`;

            paragraph.addEventListener('click', (event) => this.selectText(event.target.id))
            paragraph.addEventListener('dblclick', (event) => this.removeText(event.target.id))

            const textContent = document.createTextNode(text.value);
            paragraph.appendChild(textContent);
            this.textContainer.appendChild(paragraph);
        }

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
}