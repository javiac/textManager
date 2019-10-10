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
        })
    }

    return result;
}