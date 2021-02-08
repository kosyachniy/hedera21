// логика на попапе
document.addEventListener('DOMContentLoaded', function() {

    window.onload = init;

    function init() {
        document.getElementById("popup_auth_btn").onclick = handleAuthBtn;
    }

    if (localStorage.getItem('account')) {
        handleLoadBtn();
    } else {
        handleAccountBtn();
    }

    function onPopup(_popup) {
        document.getElementById("popup_auth").style.display = 'none';
        document.getElementById("popup_submit").style.display = 'none';
        document.getElementById("popup_account").style.display = 'none';
        document.getElementById("popup_login").style.display = 'none';

        document.getElementById(_popup).style.display = 'flex';
    }

    function handleAuthBtn() {
        onPopup('popup_login');
        document.getElementById("popup_login_btn").onclick = handleLoadBtn;
        localStorage.setItem('account', JSON.stringify({
            'accountId': '0.0.307141',
            'privateKey': '302e020100300506032b6570042204201b00250e3e1892eba8f81ee42b401354095bc59e2017c4942b6be8daf7a76844',
            'balance': 9420,
        }));
    }

    function handleLoadBtn() {
        onPopup('popup_account');
        document.getElementById("popup_id").innerHTML = JSON.parse(localStorage.getItem('account')).accountId;
        document.getElementById("popup_balance").innerHTML = `${JSON.parse(localStorage.getItem('account')).balance} HBAR`;
        document.getElementById("popup_account_btn").onclick = handleAccountBtn;
    }

    function handleAccountBtn() {
        onPopup('popup_auth');
        localStorage.removeItem('account');
    }

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        onPopup('popup_submit');

        var url = "https://api.binance.com/api/v3/ticker/price?symbol=HBARUSDT";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                const price_hbar = JSON.parse(xhr.responseText).price.substr(0, 7);
                document.getElementById("popup_submit_hbar").innerHTML = price_hbar;
                document.getElementById("popup_submit_total").innerHTML = `${Math.floor((request.price / price_hbar) * 1000) / 1000} USD`;
                document.getElementById("popup_submit_confirm_btn").onclick = handlePayBtn;
            }
        };
        xhr.send();

        document.getElementById("popup_submit_token").innerHTML = request.token;
        document.getElementById("popup_submit_from").innerHTML = request.from;
        document.getElementById("popup_submit_to").innerHTML = request.to;
        document.getElementById("popup_submit_reject_btn").onclick = handleLoadBtn;

        sendResponse({
            status: 'success',
        });
    });

    function handlePayBtn() {
        const total = Number(document.getElementById("popup_submit_total").innerHTML.split(' ')[0]);
        localStorage.setItem('account', JSON.stringify({
            'accountId': JSON.parse(localStorage.getItem('account')).accountId,
            'privateKey': JSON.parse(localStorage.getItem('account')).privateKey,
            'balance': Number(JSON.parse(localStorage.getItem('account')).balance) - total,
        }));
        handleLoadBtn();
    }

    // Example from web page
    // window.chrome.runtime.sendMessage('cpppdpikicgejffngepnhkoimoefnnke', {
    //     price: 100,
    //     token: 'MDK',
    //     from: '0.0.10143',
    //     to: '0.0.10089',
    // }, function(response) {
    //     console.log(response);
    // });

}, false);
