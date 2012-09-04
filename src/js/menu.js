/*jslint browser:true */
/*global game */
game.menu = function () {
    'use strict';
    var menu_elem = game.createContainer(),
        play = document.createElement('button'),
        resume = document.createElement('button'),
        quit = document.createElement('button'),
        setState,
        state,
        from;

    play.innerText = 'Play Game';
    game.addEvent(play, 'click', function () {
        setState('play');
    });
    resume.innerText = 'Resume Game';
    game.addEvent(resume, 'click', function () {
        setState(from);
    });
    quit.innerText = 'Quit Game';
    game.addEvent(quit, 'click', function () {
        setState('menu');
    });

    return {
        accept: function (from, to) {
            if (to === 'menu') {
                if (from === 'load' || from === 'over' || from === 'win') {
                    state = 'menu';
                    return true;
                }
            } else {
                if (from === 'play' || from === 'build') {
                    state = 'pause';
                    return true;
                }
            }
            return false;
        },
        enter: function (fromState, setStateFunc, data) {
            setState = setStateFunc;
            from = fromState;
            if (state === 'menu') {
                menu_elem.appendChild(play);
            } else {
                menu_elem.appendChild(resume);
                menu_elem.appendChild(quit);
            }
            document.body.appendChild(menu_elem);
        },
        leave: function (to) {
            state = null;
            document.body.removeChild(menu_elem);
            menu_elem.innerHTML = '';
        }
    };
};