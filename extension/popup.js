// логика на попапе
document.addEventListener('DOMContentLoaded', function() {

    // popup_auth popup_account popup_phrase
    if (localStorage.getItem('account')) {
        handlePhraseBtn();
    } else {
        handleAccountBtn();
    }


    function onPopup(_popup) {
        document.getElementById("popup_auth").style.display = 'none';
        document.getElementById("popup_phrase").style.display = 'none';
        document.getElementById("popup_account").style.display = 'none';

        document.getElementById(_popup).style.display = 'flex';
    }

    window.onload = init;

    function init() {
        document.getElementById("popup_auth_btn").onclick = handleAuthBtn;
    }

    function getRandomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function handleAuthBtn() {
        onPopup('popup_phrase');
        let arrayWords = ['apple', 'microwave', 'bird', 'squirrel', 'school', 'goose', 'market', 'kettle', 'cow', 'crossroads', 'fox', 'horse', 'frog', 'coast', 'mouse', 'monkey', 'flower', 'cheese', 'duc'];

        for (let i = 0; i < 10; i += 1) {
            const wordBlock = document.createElement("div");
            const position = getRandomInRange(1, arrayWords.length);
            if (arrayWords[position]) {
                wordBlock.innerHTML = arrayWords[position];
                arrayWords.splice(position, 1);
                wordBlock.className = "word_block";
                document.getElementById("popup_phrase_list").append(wordBlock);
            }
        }
        localStorage.setItem('account', Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
        document.getElementById("popup_phrase_btn").onclick = handlePhraseBtn;
    }

    function handlePhraseBtn() {
        onPopup('popup_account');
        document.getElementById("popup_id").innerHTML = localStorage.getItem('account');
        document.getElementById("popup_balance").innerHTML = '10000';
        document.getElementById("popup_account_btn").onclick = handleAccountBtn;
    }

    function handleAccountBtn() {
        onPopup('popup_auth');
        localStorage.removeItem('account');
    }
}, false);
