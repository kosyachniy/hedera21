console.log('%cINJECTED', 'background: #2ecc71; color: #fff; padding: 5px; margin: 2px; border-radius: 4px');

const block = document.getElementsByClassName('event_block');

let timerId = setInterval(() => {
    if (block.length !== 0) {
        StartInjection();
        clearTimeout(timerId);
    }
}, 500);

function StartInjection() {
    const accountId = '0.0.307141';
    const privateKey = '302e020100300506032b6570042204201b00250e3e1892eba8f81ee42b401354095bc59e2017c4942b6be8daf7a76844';
    const extensionId = chrome.extension.getURL('').split('//')[1].slice(0, -1);

    const extensionIdBlock = document.createElement("div");
    extensionIdBlock.id = 'hedera_mask';
    extensionIdBlock.className = `${accountId} ${privateKey} ${extensionId}`;
    document.getElementById('root').append(extensionIdBlock);
}
