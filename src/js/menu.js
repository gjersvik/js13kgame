/*jslint browser:true */
/*global game */
game.menu = function () {
    'use strict';

    return {
        accept: function (from, to) {
            return true;
        },
        enter: function (from, setStateFunc, data) {
        },
        leave: function (to) {
        }
    };
}