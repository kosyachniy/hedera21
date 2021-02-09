console.log('%cINJECTED', 'background: #2ecc71; color: #fff; padding: 5px; margin: 2px; border-radius: 4px');

const block = document.getElementsByClassName('event_block');

let timerId = setInterval(() => {
    if (block.length !== 0) {
        StartInjection();
        clearTimeout(timerId);
    }
}, 500);

function StartInjection() {
    const extensionId = chrome.extension.getURL('').split('//')[1].slice(0, -1);

    const extensionIdBlock = document.createElement("div");
    extensionIdBlock.id = 'hedera_mask';
    extensionIdBlock.className = `${extensionId}`;
    document.getElementById('root').append(extensionIdBlock);
}
