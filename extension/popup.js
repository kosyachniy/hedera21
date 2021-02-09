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
        document.getElementById("popup_sample_visitor").onclick = onInsertVisitor;
        document.getElementById("popup_sample_organiser").onclick = onInsertOrganiser;
    }

    function onInsertOrganiser() {
        document.getElementById("pass_phrase").value = 'microwave school bird horse dictionary frog coast mouse summer place comb battery';
    }

    function onInsertVisitor() {
        document.getElementById("pass_phrase").value = 'apple flower squirrel goose crossroads duc cheese market cow kettle fox monkey';
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
        onPopup('popup_submit');
        document.getElementById("popup_submit_total").innerHTML = `${price_hbar} HBAR`;
        document.getElementById("popup_submit_confirm_btn").onclick = handlePayBtn;
        document.getElementById("popup_submit_token").innerHTML = request.token;
        document.getElementById("popup_submit_from").innerHTML = request.from;
        document.getElementById("popup_submit_to").innerHTML = request.to;
        document.getElementById("popup_submit_reject_btn").onclick = onLoad;

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
        onLoad();
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
