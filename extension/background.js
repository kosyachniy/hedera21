console.log('%cINJECTED', 'background: #2ecc71; color: #fff; padding: 5px; margin: 2px; border-radius: 4px');

const block = document.getElementsByClassName('event_block');

let timerId = setInterval(() => {
    if (block.length !== 0) {
        StartInjection();
        clearTimeout(timerId);
    }
}, 500);

function StartInjection() {
    const infoBlock = document.createElement("div");
    infoBlock.innerHTML = "TOKEN";
    infoBlock.style.opacity = "0";
    document.getElementById('root').append(infoBlock);
}
