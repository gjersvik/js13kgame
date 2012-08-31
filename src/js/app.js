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
        mix: {name: 'linear'},
        xGain: 1 / 100,
        yGain: 1 / 100,
        layers: 7,
        transform: {name: 'bounce'},
        hue: [51, 59, 62],
        saturation: [0.95, 0.32, 0.24],
        value: [0.23, 0.58, 0.82]
    });
};