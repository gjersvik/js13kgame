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
        cam_x,
        cam_y,
        ship_x,
        ship_y,
        ship_velocity_x = 0,
        ship_velocity_y = 0,
        turret_angle = 0,
        mouse_x = 0,
        mouse_y = 0,
        keys = {};

    function addEvent(target, event, callback) {
        target.addEventListener(event, callback, false);
    }

    function resizeCanvas() {
        canvas_height = canvas.height = body.clientHeight;
        canvas_width = canvas.width = body.clientWidth;
        canvas_center_y = canvas_height / 2;
        canvas_center_x = canvas_width / 2;
    }
    addEvent(window, 'resize', resizeCanvas);
    resizeCanvas();

    addEvent(window, 'mousemove', function (event) {
        mouse_x = event.pageX;
        mouse_y = event.pageY;
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

    ship_x = ship_y = 1500;
    function loop() {
        // move ship
        // test for W key.
        if (keys[87]) {
            ship_velocity_y -= 0.2;
        }
        // test for S key.
        if (keys[83]) {
            ship_velocity_y += 0.2;
        }
        // test for A key.
        if (keys[65]) {
            ship_velocity_x -= 0.2;
        }
        // test for D key.
        if (keys[68]) {
            ship_velocity_x += 0.2;
        }

        // test if ship is out of bound
        if (ship_x < 30 || ship_x > 2970) {
            ship_velocity_x /= -2;
            ship_x = Math.max(Math.min(ship_x, 2969), 31);
        }
        if (ship_y < 30 || ship_y > 2970) {
            ship_velocity_y /= -2;
            ship_y = Math.max(Math.min(ship_y, 2969), 31);
        }

        ship_x += ship_velocity_x;
        ship_y += ship_velocity_y;

        //using mouse position to calculate cam position relative to ship.
        cam_x = ship_x + (mouse_x - canvas_center_x) / 2;
        cam_y = ship_y + (mouse_y - canvas_center_y) / 2;

        // find turret angle Just uses cam position.
        turret_angle = Math.atan2(cam_y - ship_y, cam_x - ship_x);


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



        // painting ship;

        paint.save();
        paint.translate(ship_x, ship_y);
        paint.lineWidth = 0;
        paint.fillStyle = "#FF0000";

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
        paint.rotate(turret_angle);
        paint.arc(0, 0, 15, 0, pi2, false);
        paint.rect(0, -5, 25, 10);
        paint.fill();

        paint.restore();

        paint.restore();

        animation(loop);
    }
    animation(loop);

}(window, document));