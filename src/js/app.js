/*jslint browser:true */
/*global game */

game.app = function () {
    'use strict';
    var self = {},
        currentState = null,
        states = {};

    self.start = function () {
        var menu = game.menu();
        states = {
            'load': game.loader(),
            'menu': menu,
            'pause': menu,
            'play': game.game(),
            'build': null,
            'over': null,
            'win': null
        };
        self.changeState('load');
    };

    self.changeState = function (to) {
        var state = states[to],
            data = null;
        if (state.accept(currentState, to)) {
            if (currentState) {
                data = states[currentState].leave(to);
            }
            state.enter(currentState, self.changeState, data);
            currentState = to;
        }
    };

    return self;
};

window.onload = function () {
    'use strict';
    var app = game.app();
    app.start();
};