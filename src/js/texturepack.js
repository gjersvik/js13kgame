/*jslint browser:true */
/*global game */
game.texturePack = function () {
    'use strict';
    var bg = {
        height: document.body.clientHeight,
        width: document.body.clientWidth,
        mix: {
            name: 'sine'
        },
        color: {
            "0": "000000FF",
            "50": "000020FF",
            "100": "640000FF"
        }
    };

    return {
        'bg0': bg,
        'bg1': bg
    };
}