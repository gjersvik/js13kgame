/*jslint browser:true */
/*global game */

game.player = function (canvas) {
    'use strict';
    var self = {
            x: 1500,
            y: 1500,
            vx: 0,
            vy: 0,
            angle: 0,
            radius: 30,
            hp: 100
        },
        mouse_x,
        mouse_y,
        shooting,
        keys;

    game.addEvent(canvas, 'mousemove', function (event) {
        mouse_x = event.pageX;
        mouse_y = event.pageY;
    });

    game.addEvent(canvas, 'mousedown', function (event) {
        shooting = true;
    });

    game.addEvent(canvas, 'mouseup', function (event) {
        shooting = false;
    });

    game.addEvent(canvas, 'keydown', function (event) {
        keys[event.keyCode] = true;
    });

    game.addEvent(canvas, 'keyup', function (event) {
        keys[event.keyCode] = false;
    });

    self.reset = function () {
        self.x = 1500;
        self.y = 1500;
        self.vx = 0;
        self.vy = 0;
        self.angle = 0;
        self.radius = 30;
        self.hp = 100;
    };

    self.hit = function (damage) {
    };

    self.advance = function (frame_count, mx, my) {
        // move ship
        // test for W key.
        if (keys[87]) {
            self.vy -= 0.2;
        }
        // test for S key.
        if (keys[83]) {
            self.vy += 0.2;
        }
        // test for A key.
        if (keys[65]) {
            self.vx -= 0.2;
        }
        // test for D key.
        if (keys[68]) {
            self.vx  += 0.2;
        }

        // test if ship is out of bound
        game.gridBounce(self);

        self.x += self.vx;
        self.y += self.vy;

        // find turret angle Just uses cam position.
        self.angle = Math.atan2(my - ship.y, mx - ship.x);
    };

    self.paint = function (paint) {
        paint.save();
        paint.translate(ship.x, ship.y);
        paint.fillStyle = "#0000FF";

        paint.beginPath();
        paint.moveTo(20, 0);
        paint.arc(0, 0, 30, 0.1, half_pi - 0.1, false);
        paint.lineTo(0, 20);
        paint.arc(0, 0, 30, half_pi + 0.1, pi - 0.1, false);
        paint.lineTo(-20, 0);
        paint.arc(0, 0, 30, pi + 0.1, pi + half_pi - 0.1, false);
        paint.lineTo(0, -20);
        paint.arc(0, 0, 30, pi + half_pi + 0.1, pi2 - 0.1, false);
        paint.fill();

        paint.fillStyle = "#FFFF00";
        // WDSA
        [87, 68, 83, 65].forEach(function (key) {
            paint.rotate(half_pi);
            if (keys[key]) {
                paint.beginPath();
                paint.moveTo(20, 0);
                paint.arc(0, 0, 40, -0.1, 0.1, false);
                paint.fill();
            }
        });

        // paint turret
        paint.beginPath();
        paint.fillStyle = "#00FFFF";
        paint.rotate(self.angle);
        paint.arc(0, 0, 15, 0, pi2, false);
        paint.rect(0, -5, 25, 10);
        paint.fill();

        paint.restore();
    };

    return self;
};