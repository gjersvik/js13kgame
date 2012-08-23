/*jslint browser:true */
(function (window, document) {
    'use strict';
    var canvas = document.getElementsByTagName('canvas')[0],
        body = document.body,
        paint = canvas.getContext('2d'),
        animation = window.requestAnimationFrame,
        camx, camy, shipx, shipy, mousex, mousey;

    function addEvent(target, event, callback) {
        target.addEventListener(event, callback, false);
    }

    function resizeCanvas() {
        canvas.height = body.clientHeight;
        canvas.width = body.clientWidth;
    }
    addEvent(window, 'resize', resizeCanvas);
    resizeCanvas();

    addEvent(window, 'mousemove', function (event) {
        mousex = event.pageX;
        mousey = event.pageY;
    });

    ['ms', 'moz', 'webkit', 'o'].forEach(function (vendor) {
        animation = animation || window[vendor + 'RequestAnimationFrame'];
    });
//    animation = animation || function (callback) {
//        setTimeout(16, callback);
//    };

    camx = camy = shipx = shipy = 1500;
    function loop() {
        paint.clearRect(0, 0, canvas.width, canvas.height);
        paint.save();
        paint.translate(camx * -1, camy * -1);

        var i = 0;

        paint.strokeStyle = "#666666";
        paint.lineWidth = 2;
        paint.beginPath();

        while (i < 5) {
            i += 1;
            paint.moveTo(i * 500, 0);
            paint.lineTo(i * 500, 3000);
        }
        i = 0;
        while (i < 5) {
            i += 1;
            paint.moveTo(0, i * 500);
            paint.lineTo(3000, i * 500);
        }
        paint.stroke();

        paint.lineWidth = 10;
        paint.strokeStyle = "#FF0000";
        paint.strokeRect(0, 0, 3000, 3000);

        paint.restore();

        animation(loop);
    }
    animation(loop);

}(window, document));