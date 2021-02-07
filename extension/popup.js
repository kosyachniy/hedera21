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
        document.getElementById("popup_login").style.display = 'none';

        document.getElementById(_popup).style.display = 'flex';
    }

    window.onload = init;

    function init() {
        document.getElementById("popup_auth_btn").onclick = handleAuthBtn;
        document.getElementById("popup_auth0_btn").onclick = handleAuth0Btn;
    }

    function getRandomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function handleAuth0Btn() {
        onPopup('popup_login');
        document.getElementById("popup_login_btn").onclick = handlePhraseBtn;
        localStorage.setItem('account', JSON.stringify({
            'id': `0.0.101${getRandomInRange(1, 99)}`,
            'balance': 9420,
        }));
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
        localStorage.setItem('account', JSON.stringify({
            'id': `0.0.101${getRandomInRange(1, 99)}`,
            'balance': 0,
        }));
        document.getElementById("popup_phrase_btn").onclick = handlePhraseBtn;
    }

    function handlePhraseBtn() {
        onPopup('popup_account');
        document.getElementById("popup_id").innerHTML = JSON.parse(localStorage.getItem('account')).id;
        document.getElementById("popup_balance").innerHTML = `${JSON.parse(localStorage.getItem('account')).balance} HBAR`;
        document.getElementById("popup_account_btn").onclick = handleAccountBtn;
    }

    function handleAccountBtn() {
        onPopup('popup_auth');
        localStorage.removeItem('account');
    }
}, false);
