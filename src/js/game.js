/*jslint browser:true */
(function (window, document) {
    'use strict';
    var pi = Math.PI,
        pi2 = pi * 2,
        half_pi = pi / 2,
        canvas = document.getElementsByTagName('canvas')[0],
        canvas_height,
        canvas_width,
        canvas_center_y,
        canvas_center_x,
        body = document.body,
        paint = canvas.getContext('2d'),
        animation = window.requestAnimationFrame,
        grid = {
            h: 3000,
            w: 3000
        },
        cam_x,
        cam_y,
        ship = {
            x: 1500,
            y: 1500,
            vx: 0,
            vy: 0,
            angle: 0,
            radius: 30
        },
        mouse_x = 0,
        mouse_y = 0,
        keys = {},
        shoots = [],
        enemies = [],
        shooting = false,
        frame_count = 0;

    function addEvent(target, event, callback) {
        target.addEventListener(event, callback, false);
    }

    function resizeCanvas() {
        canvas_height = canvas.height = body.clientHeight;
        canvas_width = canvas.width = body.clientWidth;
        canvas_center_y = canvas_height / 2;
        canvas_center_x = canvas_width / 2;
    }

    function gridBounce(sprite) {
        if (sprite.x < sprite.radius || sprite.x > grid.w - sprite.radius) {
            sprite.vx /= -2;
            sprite.x = Math.max(Math.min(sprite.x, grid.w - sprite.radius - 1), sprite.radius + 1);
        }
        if (sprite.y < sprite.radius || sprite.y > grid.h - sprite.radius) {
            sprite.vy /= -2;
            sprite.y = Math.max(Math.min(sprite.y, grid.h - sprite.radius - 1), sprite.radius + 1);
        }
    }
    /* DNA:
        0: size
            3: hp
            4: regen
            5: armor
        1: speed
            6: axsel
            7: topspeed
            8: turnrate
        2: atack
            9: homing
            10: spreed
            11: bullet speed
            12: damage
                13: dps
                14: firerate
                15: number of shoots
     */

    function enemy(power_points, dna) {
        // if enemy have no dna generate a random mutant
        if (!dna) {
            dna = [];
            while (dna.length < 16) {
                dna.push(Math.random());
            }
        }

        var self = {
            dna: dna,
            weightedDna: [],
            powerPoints: power_points,
            x: grid.w * Math.random(),
            y: grid.h * Math.random(),
            vx: 0,
            vy: 0,
            angle: 0,
            radius: 30
        };

        function weight(array, base) {
            var sum = array.reduce(function (a, b) {
                return a + b;
            });
            return array.map(function (item) {
                return item / sum * base;
            });
        }

        self.weightedDna = weight(dna.slice(0, 2), 1);
        self.weightedDna = self.weightedDna.concat(weight(dna.slice(3, 5), self.weightedDna[0]));
        self.weightedDna = self.weightedDna.concat(weight(dna.slice(6, 8), self.weightedDna[1]));
        self.weightedDna = self.weightedDna.concat(weight(dna.slice(9, 12), self.weightedDna[3]));
        self.weightedDna = self.weightedDna.concat(weight(dna.slice(13, 15), self.weightedDna[12]));

        self.radius = 10 + 100 * self.weightedDna[0];

        self.advance = function () {
            gridBounce(self);
        };

        self.paint = function () {
            paint.save();
            paint.translate(self.x, self.y);
            paint.fillStyle = "#FF0000";

            paint.beginPath();
            paint.moveTo(self.radius * 2 / 3, 0);
            paint.arc(0, 0, self.radius, 0.1, half_pi - 0.1, false);
            paint.lineTo(0, self.radius * 2 / 3);
            paint.arc(0, 0, self.radius, half_pi + 0.1, pi - 0.1, false);
            paint.lineTo(self.radius * -2 / 3, 0);
            paint.arc(0, 0, self.radius, pi + 0.1, pi + half_pi - 0.1, false);
            paint.lineTo(0, self.radius * -2 / 3);
            paint.arc(0, 0, self.radius, pi + half_pi + 0.1, pi2 - 0.1, false);
            paint.fill();
            paint.restore();
        };

        return self;
    }

    while (enemies.length < 16) {
        enemies.push(enemy());
    }

    addEvent(window, 'resize', resizeCanvas);
    resizeCanvas();

    addEvent(window, 'mousemove', function (event) {
        mouse_x = event.pageX;
        mouse_y = event.pageY;
    });

    addEvent(window, 'mousedown', function (event) {
        shooting = true;
    });

    addEvent(window, 'mouseup', function (event) {
        shooting = false;
    });

    addEvent(window, 'keydown', function (event) {
        keys[event.keyCode] = true;
    });

    addEvent(window, 'keyup', function (event) {
        keys[event.keyCode] = false;
    });

    ['ms', 'moz', 'webkit', 'o'].forEach(function (vendor) {
        animation = animation || window[vendor + 'RequestAnimationFrame'];
    });
//    animation = animation || function (callback) {
//        setTimeout(16, callback);
//    };

    function loop() {
        frame_count += 1;

        // move ship
        // test for W key.
        if (keys[87]) {
            ship.vy -= 0.2;
        }
        // test for S key.
        if (keys[83]) {
            ship.vy += 0.2;
        }
        // test for A key.
        if (keys[65]) {
            ship.vx -= 0.2;
        }
        // test for D key.
        if (keys[68]) {
            ship.vx  += 0.2;
        }

        // test if ship is out of bound
        gridBounce(ship);

        // Create shoot.
        if (shooting && frame_count % 10 === 0) {
            shoots.push({
                x: ship.x,
                y: ship.y,
                vx: ship.vx + Math.cos(ship.angle) * 10,
                vy: ship.vy + Math.sin(ship.angle) * 10,
                radius: 5
            });
            ship.vx -= Math.cos(ship.angle) * 0.2;
            ship.vy -= Math.sin(ship.angle) * 0.2;

            if (shoots.length > 10) {
                shoots.shift();
            }
        }


        ship.x += ship.vx;
        ship.y += ship.vy;

        //using mouse position to calculate cam position relative to ship.
        cam_x = ship.x + (mouse_x - canvas_center_x) / 2;
        cam_y = ship.y + (mouse_y - canvas_center_y) / 2;

        // find turret angle Just uses cam position.
        ship.angle = Math.atan2(cam_y - ship.y, cam_x - ship.x);

        // advance shots
        shoots.forEach(function (shoot) {
            shoot.x += shoot.vx;
            shoot.y += shoot.vy;
            gridBounce(shoot);
        });

        // advance enemies
        enemies.forEach(function (enemy) {
            enemy.advance();
        });

        //start painting by removing
        paint.clearRect(0, 0, canvas_width, canvas_height);
        paint.save();
        paint.translate((cam_x - canvas_center_x) * -1, (cam_y - canvas_center_y) * -1);

        // painting background;
        var i = 0;

        paint.strokeStyle = "#666666";
        paint.lineWidth = 2;
        paint.beginPath();

        while (i < 5) {
            i += 1;
            paint.moveTo(i * 500, 0);
            paint.lineTo(i * 500, 3000);
        }
        i = 0;
        while (i < 5) {
            i += 1;
            paint.moveTo(0, i * 500);
            paint.lineTo(3000, i * 500);
        }
        paint.stroke();

        paint.lineWidth = 10;
        paint.strokeStyle = "#FF0000";
        paint.strokeRect(0, 0, 3000, 3000);

        //paint shots
        paint.lineWidth = 0;
        paint.fillStyle = "#FFFFFF";

        paint.beginPath();
        shoots.forEach(function (shoot) {
            paint.moveTo(shoot.x, shoot.y);
            paint.arc(shoot.x, shoot.y, shoot.radius, 0, pi2, false);
        });
        paint.fill();

        // paint enemies
        enemies.forEach(function (enemy) {
            enemy.paint();
        });

        // painting ship;

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
        paint.rotate(ship.angle);
        paint.arc(0, 0, 15, 0, pi2, false);
        paint.rect(0, -5, 25, 10);
        paint.fill();

        paint.restore();

        paint.restore();

        animation(loop);
    }
    animation(loop);

}(window, document));