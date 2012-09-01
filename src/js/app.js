/*jslint browser:true */
/**
 * @const
 */
var game = {};

/**
 * @const
 * @type {Number}
 */
game.GRID_H = 3000;
/**
 * @const
 * @type {Number}
 */
game.GRID_W = 3000;

game.addEvent = function (target, event, callback) {
    'use strict';
    target.addEventListener(event, callback, false);
};

game.app = function (window, document) {
    'use strict';
    var animation = window.requestAnimationFrame,
        frame_count = 0,
        bg = game.background(document.getElementById('bg'));
    ['ms', 'moz', 'webkit', 'o'].forEach(function (vendor) {
        animation = animation || window[vendor + 'RequestAnimationFrame'];
    });

    function resize() {
        var width = document.body.clientWidth,
            height = document.body.clientHeight;
        bg.resize(width, height);
    }
    game.addEvent(window, 'resize', resize);
    resize();

    function paint() {
        frame_count += 1;
        bg.paint(frame_count);
        animation(paint);
    }
    animation(paint);
};

window.onload = function () {
    'use strict';
    document.getElementById('test').src = game.textureBuilder({
        mix: {
            name: 'sine'
        },
        color: {
            "0": "000000FF",
            "50": "000020FF",
            "100": "640000FF"
        }
    });
};