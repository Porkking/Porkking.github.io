window.onload = function() {
    var oDiv = document.getElementById('div1');
    var oUl = oDiv.getElementsByTagName('ul')[0];
    var aLi = oUl.getElementsByTagName('li');
    var aA = document.getElementsByClassName('operation');
    var timer = null;
    var iSpeed = 3;
    oUl.innerHTML += oUl.innerHTML;
    oUl.style.width = aLi.length * aLi[0].offsetWidth + 'px';

    function fnMove() {
        if (oUl.offsetLeft < -oUl.offsetWidth / 2) {
            oUl.style.left = 0;
        } else if (oUl.offsetLeft > 0) {
            oUl.style.left = -oUl.offsetWidth / 2 + 'px';
        }
        oUl.style.left = oUl.offsetLeft + iSpeed + 'px';
    }
    timer = setInterval(fnMove, 30);
    aA[0].onclick = function() {
        iSpeed = -3;
    }
    aA[1].onclick = function() {
        iSpeed = 3;
    }
    oDiv.onmouseover = function() {
        clearInterval(timer);
    }
    oDiv.onmouseout = function() {
        timer = setInterval(fnMove, 30);
    }
};