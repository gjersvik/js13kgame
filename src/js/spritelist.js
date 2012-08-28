/*global game */
game.spriteList = function () {
    'use strict';
    var self = {},
        list = [],
        empty_cells = [];

    self.add = function (sprite) {
        var id = list.length;

        if (empty_cells.length > 0){
            id = empty_cells.pop();
        }
        sprite.listId = id;
        list[id] = sprite;
    };

    self.remove = function (sprite) {
        delete list[sprite.listId];
        empty_cells.push(sprite.listId);
        delete sprite.listId;
    };

    self.forEach = function (callback) {
        list.forEach(function (sprite) {
            if (sprite) {
                callback(sprite);
            }
        });
    };

    self.clean = function () {
        self.forEach(function (sprite) {
            if(sprite.deleteMe){
                self.remove(sprite);
            }
        });
    };

    self.collisionDetection = function (other_list, callback) {
        self.forEach(function (sprite) {
            other_list.forEach(function (other_sprite) {
                var radii = sprite.radius + other_sprite.radius,
                    dist_x = sprite.x - other_sprite.x,
                    dist_y = sprite.y - other_sprite.y;

                if ((dist_x * dist_x)  + (dist_y * dist_y) < radii * radii) {
                    callback(sprite, other_sprite);
                }
            });
        });
    };
    return self;
};