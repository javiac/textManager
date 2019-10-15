import moment from 'moment';

export function setupMockjax() {
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
            createdAt: moment().format('MMMM Do YYYY, HH:mm:ss')
        })
    }

    return result;
}

export function createElementWithText(tagName, text) {
    const element = document.createElement(tagName);
    const textNode = document.createTextNode(text);
    element.appendChild(textNode);

    return element;
}