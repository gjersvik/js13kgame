/*global game */
/* DNA:
    0: size
        3: hp
        4: regen
        5: armor
    1: speed
        6: axsel
        7: topspeed
        8: engine responce time
    2: atack
        9: homing
        10: spreed
        11: bullet speed
        12: damage
            13: dps
            14: firerate
            15: number of shoots
    16: engine;
 */
game.enemy = function (power_points, dna) {
    // if enemy have no dna generate a random mutant
    if (!dna) {
        dna = [];
        while (dna.length < 17) {
            dna.push(Math.random());
        }
    }

    var self = {
            dna: dna,
            weightedDna: [],
            powerPoints: power_points,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            angle: 0,
            radius: 30
        },
        acceleration,
        topSpeed,
        engineSampleRate,
        engines = [false, false, false, false];


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
    acceleration = 0.5 * self.weightedDna[6];
    topSpeed = 30 * self.weightedDna[7];
    engineSampleRate = Math.ceil(120 * (1 - self.weightedDna[8]));

    self.hit = function (damage) {
        self.deleteMe = true;
    };

    self.advance = function (frame_count) {
        if (frame_count % engineSampleRate === 0) {
            engines = engines.map(function () {
                return self.dna[16] / 4 >= Math.random();
            });
        }

        if (engines[0]) {
            self.vy -= 0.2;
        }
        // test for S key.
        if (engines[2]) {
            self.vy += 0.2;
        }
        // test for A key.
        if (engines[3]) {
            self.vx -= 0.2;
        }
        // test for D key.
        if (engines[1]) {
            self.vx  += 0.2;
        }
        self.vx = game.containNumber(self.vx, topSpeed * -1, topSpeed);
        self.vy = game.containNumber(self.vy, topSpeed * -1, topSpeed);

        self.x += self.vx;
        self.y += self.vy;

        game.gridBounce(self);
    };

    self.paint = function (paint) {
        var pi = Math.PI,
            pi2 = pi * 2,
            half_pi = pi / 2;
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

        paint.fillStyle = "#FFFF00";
        // WDSA
        engines.forEach(function (active) {
            paint.rotate(half_pi);
            if (active) {
                paint.beginPath();
                paint.moveTo(self.radius * 2 / 3, 0);
                paint.arc(0, 0, self.radius * 4 / 3, -0.1, 0.1, false);
                paint.fill();
            }
        });

        paint.restore();
    };

    return self;
};