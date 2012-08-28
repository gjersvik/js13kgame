var game = {};

game.containNumber = function(number, from, to){
    if (number < from) {
        return from;
    }
    if (number > to) {
        return to;
    }
    return number;
};

game.gridBounce = function(sprite) {
    var grid = {h: 3000, w: 3000};
    if (sprite.x < sprite.radius || sprite.x > grid.w - sprite.radius) {
        sprite.vx /= -2;
        sprite.x = game.containNumber(sprite.x, sprite.radius + 1, grid.w - sprite.radius - 1);
    }
    if (sprite.y < sprite.radius || sprite.y > grid.h - sprite.radius) {
        sprite.vy /= -2;
        sprite.y = game.containNumber(sprite.y, sprite.radius + 1, grid.h - sprite.radius - 1);
    }
}