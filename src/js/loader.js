/*jslint browser:true */
/*global game */
game.loader = function () {
    'use strict';
    var loader_elem = game.createContainer(),
        done = 0,
        total = 10,
        setState = null;

    function update_view() {
        loader_elem.innerHTML = '<h1>' + done + ' of ' + total + ' textures made</h1>';
    }

    function loop() {
        if (done < total) {
            done += 1;
            update_view();
            setTimeout(loop, 1000);
        } else {
            setState('menu');
        }
    }

    return {
        accept: function (from, to) {
            return from === null;
        },
        enter: function (from, setStateFunc, data) {
            setState = setStateFunc;
            update_view();
            document.body.appendChild(loader_elem);
            setTimeout(loop, 0);
        },
        leave: function (to) {
            document.body.removeChild(loader_elem);
            return null;
        }
    };
}