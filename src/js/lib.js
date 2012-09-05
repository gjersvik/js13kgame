/*jslint browser:true */
/*global game */
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

game.addEvent = function (target, event, callback) {
    'use strict';
    target.addEventListener(event, callback, false);
};

game.createContainer = function (id, tag) {
    'use strict';
    tag = tag || 'div';
    var elem = document.createElement(tag);
    if (id) {
        elem.id = id;
    }
    elem.className = 'container';
    return elem;
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

game.animateTimer = (function () {
    'use strict';
    var animation = window.requestAnimationFrame;
    ['ms', 'moz', 'webkit', 'o'].forEach(function (vendor) {
        animation = animation || window[vendor + 'RequestAnimationFrame'];
    });
    return function (callback) {
        animation(callback);
    };
}());