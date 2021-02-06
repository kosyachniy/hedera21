// логика на попапе
document.addEventListener('DOMContentLoaded', function() {
    window.onload = init;

    function init() {
        var button = document.getElementById("popup-btn")
        button.onclick = handleButtonClick;
    }

    function handleButtonClick() {
        document.getElementById("popup_public_key").innerHTML = 'cpppdpikicgejffngepnhk';
        document.getElementById("popup_private_key").innerHTML = 'ghbmnnjooekpmoecnnnilnn';
    }
}, false);
