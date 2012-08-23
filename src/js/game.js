/*jslint browser:true */
(function (window, document) {
    'use strict';
    var canvas = document.getElementsByTagName('canvas')[0],
        body = document.body,
        paint = canvas.getContext('2d');

    function addEvent(target, event, callback) {
        target.addEventListener(event, callback, false);
    }

    function resizeCanvas() {
        canvas.height = body.clientHeight;
        canvas.width = body.clientWidth;
    }
    addEvent(window, 'resize', resizeCanvas);
    resizeCanvas();

}(window, document));