/*jslint browser:true */
/*global game */
game.loader = function () {
    'use strict';
    var loader_elem = game.createContainer(),
        texture_pack,
        keys,
        i = 0,
        total,
        setState = null;

    function update_view() {
        loader_elem.innerHTML = '<h1>' + i + ' of ' + total + ' textures made</h1>';
    }

    function loop() {
        if (i === total) {
            setState('menu');
            return;
        }
        game.texture.create(keys[i], texture_pack[keys[i]]);
        i += 1;
        update_view();
        setTimeout(loop, 0);
    }

    return {
        accept: function (from, to) {
            return from === null;
        },
        enter: function (from, setStateFunc, data) {
            setState = setStateFunc;
            texture_pack = game.texturePack();
            keys = Object.getOwnPropertyNames(texture_pack);
            total = keys.length;
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