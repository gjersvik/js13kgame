/*jslint browser:true */
/*global game */

game.game = function () {
    'use strict';
    var canvas = game.createContainer(null, 'canvas'),
        paint = canvas.getContext('2d'),
        setState,
        running = false;

    function newGame() {

    }

    function nextLevel() {

    }

    function paintBG() {
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
    }

    function loop() {
        if (!running) {
            return;
        }

        //advance

        //paint
        paint.clearRect(0, 0, canvas.width, canvas.height);
        paint.save();
        paintBG();

        paint.restore();
        game.animateTimer(loop);
    }

    return {
        accept: function (from, to) {
            if (from === 'build' || from === 'pause' || from === 'menu') {
                return true;
            }
            return false;
        },
        enter: function (from, setStateFunc, data) {
            setState = setStateFunc;
            if (from === 'menu') {
                newGame();
            }
            if (from === 'build') {
                nextLevel();
            }
            running = true;
            game.animateTimer(loop);

            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;
            document.body.appendChild(canvas);
        },
        leave: function (to) {
            running = false;
            document.body.removeChild(canvas);
        }
    };
};

(function (window, document, game) {
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
        player_shoots = game.spriteList(),
        enemies = game.spriteList(),
        shooting = false,
        frame_count = 0;


    function resize() {
        var width = document.body.clientWidth,
            height = document.body.clientHeight;
        bg.resize(width, height);
    }
    game.addEvent(window, 'resize', resize);
    resize();

    function paint() {
        frame_count += 1;
        bg.paint(frame_count);
        animation(paint);
    }
    animation(paint);

    function resizeCanvas() {
        canvas_height = canvas.height = body.clientHeight;
        canvas_width = canvas.width = body.clientWidth;
        canvas_center_y = canvas_height / 2;
        canvas_center_x = canvas_width / 2;
    }

    (function () {
        var i = 0,
            enemy;
        while (i < 50) {
            i += 1;
            enemy = game.enemy();
            enemy.x = grid.w * Math.random(),
            enemy.y = grid.h * Math.random(),
            enemies.add(enemy);
        }
    }());

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

        // clean lists
        enemies.clean();
        player_shoots.clean();

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
        game.gridBounce(ship);

        // Create shoot.
        if (shooting && frame_count % 10 === 0) {
            player_shoots.add({
                x: ship.x,
                y: ship.y,
                vx: ship.vx + Math.cos(ship.angle) * 10,
                vy: ship.vy + Math.sin(ship.angle) * 10,
                radius: 5
            });
            ship.vx -= Math.cos(ship.angle) * 0.2;
            ship.vy -= Math.sin(ship.angle) * 0.2;
        }


        ship.x += ship.vx;
        ship.y += ship.vy;

        //using mouse position to calculate cam position relative to ship.
        cam_x = ship.x + (mouse_x - canvas_center_x) / 2;
        cam_y = ship.y + (mouse_y - canvas_center_y) / 2;

        // find turret angle Just uses cam position.
        ship.angle = Math.atan2(cam_y - ship.y, cam_x - ship.x);

        // advance shots
        player_shoots.forEach(function (shoot) {
            shoot.x += shoot.vx;
            shoot.y += shoot.vy;
            game.gridBounce(shoot);
        });

        // advance enemies
        enemies.forEach(function (enemy) {
            enemy.advance(frame_count);
        });

        //collision detection
        player_shoots.collisionDetection(enemies, function (shoot, enemy) {
            enemy.hit();
            shoot.deleteMe = true;
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
        player_shoots.forEach(function (shoot) {
            paint.moveTo(shoot.x, shoot.y);
            paint.arc(shoot.x, shoot.y, shoot.radius, 0, pi2, false);
        });
        paint.fill();

        // paint enemies
        enemies.forEach(function (enemy) {
            enemy.paint(paint);
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

});