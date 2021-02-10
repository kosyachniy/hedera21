// логика на попапе
document.addEventListener('DOMContentLoaded', function() {

    window.onload = onInit;

    function onInit() {
        if (localStorage.getItem('account')) {
            onLoad();
        } else {
            onExit();
        }
    }

    function onPopup(popup) {
        document.getElementById("popup_auth").style.display = 'none';
        document.getElementById("popup_phrase").style.display = 'none';
        document.getElementById("popup_account").style.display = 'none';
        document.getElementById("popup_submit").style.display = 'none';

        document.getElementById(popup).style.display = 'flex';
    }

    function onExit() {
        onPopup('popup_auth');
        document.getElementById("popup_auth_btn").onclick = onAuth;
        localStorage.removeItem('account');
    }

    function onAuth() {
        onPopup('popup_phrase');
        document.getElementById("popup_phrase_btn").onclick = onCheck;
        document.getElementById("popup_sample_visitor").onclick = function() {
            document.getElementById("pass_phrase").value = 'microwave school bird horse dictionary frog coast mouse summer place comb battery';
        };
        document.getElementById("popup_sample_organiser").onclick = function() {
            document.getElementById("pass_phrase").value = 'apple flower squirrel goose crossroads duc cheese market cow kettle fox monkey';
        }

    }

    function onCheck() {
        const phrase = document.getElementById("pass_phrase").value;
        if (phrase === 'microwave school bird horse dictionary frog coast mouse summer place comb battery') {
            localStorage.setItem('account', JSON.stringify({
                'accountId': '0.0.310391',
                'publicKey': '302a300506032b6570032100dd76522385af5da95872eab455df7473bc904a0d5a5d81642c462e36ffafc1ac',
                'privateKey': '302e020100300506032b6570042204200a9b61eec3886381675735cb940b7850d1ef0aa373105a637f185c87e0d1a36b',
                'balance': 9420,
            }));
            document.getElementById("pass_phrase").value = '';
            onLoad();
        } else if (phrase === 'apple flower squirrel goose crossroads duc cheese market cow kettle fox monkey') {
            localStorage.setItem('account', JSON.stringify({
                'accountId': '0.0.307141',
                'privateKey': '302e020100300506032b6570042204201b00250e3e1892eba8f81ee42b401354095bc59e2017c4942b6be8daf7a76844',
                'balance': 1840,
            }));
            document.getElementById("pass_phrase").value = '';
            onLoad();
        } else {
            document.getElementById("popup_sample_error").innerHTML = 'No valid phrase'
        }
    }

    function onLoad() {
        onPopup('popup_account');
        document.getElementById("popup_id").innerHTML = JSON.parse(localStorage.getItem('account')).accountId;
        document.getElementById("popup_balance").innerHTML = `${JSON.parse(localStorage.getItem('account')).balance} HBAR`;
        document.getElementById("popup_account_btn").onclick = onExit;
    }

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        if (localStorage.getItem('account')) {
            onPopup('popup_submit');

            if (request.title) {
                document.getElementById("popup_submit_title").innerHTML = `Title: ${request.title}`;
            }
            if (request.count) {
                document.getElementById("popup_submit_count").innerHTML = `Number of tickets: ${request.count}`;
            }
            if (request.priceTicket) {
                document.getElementById("popup_submit_priceTicket").innerHTML = `Ticket price: ${request.priceTicket}`;
            }

            if (request.price) {
                document.getElementById("popup_submit_price").innerHTML = `Price: ${request.price} HBAR`;
            }

            if (request.token) {
                document.getElementById("popup_submit_token").innerHTML = `Token: ${request.token}`;
            }

            document.getElementById("popup_submit_from").innerHTML = `From: ${JSON.parse(localStorage.getItem('account')).accountId}`;
            document.getElementById("popup_submit_to").innerHTML = `To: ${request.to}`;
            document.getElementById("popup_submit_confirm_btn").onclick = (e, sendResponseFunc = sendResponse) => {
                sendResponseFunc({
                    status: 'success',
                    accountId: JSON.parse(localStorage.getItem('account')).accountId,
                    privateKey: JSON.parse(localStorage.getItem('account')).privateKey,
                });

                let price = 0;
                if (document.getElementById("popup_submit_price").innerHTML !== '') {
                    price = Number(document.getElementById("popup_submit_price").innerHTML.split(' ')[1]);
                }
                localStorage.setItem('account', JSON.stringify({
                    'accountId': JSON.parse(localStorage.getItem('account')).accountId,
                    'privateKey': JSON.parse(localStorage.getItem('account')).privateKey,
                    'balance': (JSON.parse(localStorage.getItem('account')).balance - price).toFixed(2),
                }));
                onLoad();
            };
            document.getElementById("popup_submit_reject_btn").onclick = (e, sendResponseFunc = sendResponse) => {
                sendResponseFunc({
                    status: 'failure',
                });
                onLoad();
            };
        } else {
            sendResponse({
                status: '!Authorization error',
            });
            onExit();
        }
    });

}, false);
