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
