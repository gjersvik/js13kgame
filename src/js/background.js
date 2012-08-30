/*global game */

game.background = function (canvas) {
    'use strict';
    var self = {},
        canvas_height = 1024,
        canvas_width = 1024,
        full_paint = true,
        paint = canvas.getContext('2d'),
        fromGrid,
        toGrid,
        current_grid_time = 0;
    canvas.height = canvas_height;
    canvas.width = canvas_width;

    function mix(first, second, posision) {
        posision = posision * posision * (3 - 2 * posision);
        return first * (1 - posision) + second * posision;
    }

    function linerMix(first, second, posision) {
        return first * (1 - posision) + second * posision;
    }


    function createRandomGrid() {
        var data = [],
            i = 0,
            length = 256 * 256;
        while (i < length) {
            data[i] = Math.random();
            i += 1;
        }
        return data;
    }
    fromGrid = createRandomGrid();
    toGrid = createRandomGrid();

    function mixGrid(x, y, t) {
        return linerMix(fromGrid[y * 256 + x], toGrid[y * 256 + x], t);
    }

    function getNoise(x, y, t) {
        var int_x = Math.floor(x),
            int_y = Math.floor(y),
            float_x = x - int_x,
            float_y = y - int_y,
            int_x2 = int_x + 1,
            int_y2 = int_y + 1;

        int_x = int_x % 256;
        int_y = int_y % 256;
        int_x2 = int_x2 % 256;
        int_y2 = int_y2 % 256;


        return mix(
            mix(
                mixGrid(int_x, int_y, t),
                mixGrid(int_x, int_y2, t),
                float_y
            ),
            mix(
                mixGrid(int_x2, int_y, t),
                mixGrid(int_x2, int_y2, t),
                float_y
            ),
            float_x
        );
    }

    function getFractalNoise(x, y, t) {
        var numLayers = 5,
            frequency = 1,
            amplitude = 1,
            fractalNoise = 0,
            lacunarity = 3,
            gain = 0.5,
            maxSum = 0,
            i = 0;
        while (i < numLayers){
            maxSum += amplitude;
            fractalNoise += getNoise(x * frequency, y * frequency, t) * amplitude;
            amplitude *= gain;
            frequency *= lacunarity;
            i += 1;
        }
        // normalise the result
        fractalNoise /= maxSum;
        return fractalNoise;
    }

    self.paint = function (frame_count) {
        var image = paint.getImageData(0, 0, canvas_width, canvas_height),
            pixels = image.data,
            x = 0,
            y = 0,
            skip = 1,
            noise = 0,
            index = 0,
            time = frame_count / 100;

        if (time >= current_grid_time + 1) {
            fromGrid = toGrid;
            toGrid = createRandomGrid();
            current_grid_time += 1;
        }

        time -= Math.floor(time);

        while (y < canvas_height) {
            x = 0;
            while (x < canvas_width) {
                noise = getFractalNoise(x / 100, y / 100, time);
                index = y * canvas_width * 4 + x * 4;
                pixels[index] = 200 * Math.max(noise - 0.5, 0);
                pixels[index + 1] = 0;
                pixels[index + 2] = 32 - Math.abs(64 * noise - 32);
                pixels[index + 3] = 255;
                x += skip;
            }
            y += skip;
        }

        paint.putImageData(image, 0, 0);
    };

    self.resize = function (width, height) {
        canvas_width = canvas.width = width;
        canvas_height = canvas.height = height;
        full_paint = true;
    };

    return self;
};