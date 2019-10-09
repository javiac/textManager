let textManager;

window.onload = () => {
    textManager = new TextManager('textContainer', 'buttonsContainer');
    textManager.redraw();
    setupMockjax();
}

function onAdd() {
    const text = prompt("Please enter a new text", "My new text");

    if (text) {
        textManager.addText(text);
    }
}

function onRemove() {
    textManager.removeSelectedTexts();
}

function onUndo() {
    textManager.undo();
}

function onRedo() {
    textManager.redo();
}

function onResetMock() {
    textManager.resetMock();
}

function setupMockjax() {
    $.mockjax({
        url: "/demoTexts",
        responseText: {
            status: "success",
            data: generateMockupTexts()
        }
    });
}

function generateMockupTexts() {
    const result = [];
    for (let i = 0; i < 50; i++) {
        result.push({
            id: uuidv4(),
            value: `${i.toString()} Demo textoooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo ${i.toString()}`,
        })
    }

    return result;
}