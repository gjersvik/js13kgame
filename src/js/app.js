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

/**
 * @param {number} number
 * @param {number} from
 * @param {number} to
 * @return {number}
 */
game.containNumber = function (number, from, to) {
    'use strict';
    if (number < from) {
        return from;
    }
    if (number > to) {
        return to;
    }
    return number;
};

game.gridBounce = function (sprite) {
    'use strict';
    if (sprite.x < sprite.radius || sprite.x > game.GRID_W - sprite.radius) {
        sprite.vx /= -2;
        sprite.x = game.containNumber(sprite.x, sprite.radius + 1, game.GRID_W - 1 - sprite.radius);
    }
    if (sprite.y < sprite.radius || sprite.y > game.GRID_H - sprite.radius) {
        sprite.vy /= -2;
        sprite.y = game.containNumber(sprite.y, sprite.radius + 1, game.GRID_H - 1 - sprite.radius);
    }
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
    var app = game.app(window, document);
};