/*global game, document*/
/*var default_options = {
    name: 'texture1',
    height: 1024,
    width: 1024,
    gridHeight: 256,
    gridWidth: 256,
    random: Math.random(),
    mix: {
        name: 'linear',
        ease: 'innout',
        param: undefined
    },
    layers: 5,
    lacunarity: 2,
    gain: 0.5,
    transform: {
        name: 'linear',
        ease: 'innout',
        param: undefined
    },
    xGain: 1/100,
    yGain: 1/100,
    colors:{
        0:"000000FF",
        100:"FFFFFFFF"
    }
};*/

(function (document, game) {
    'use strict';
    var transformations = {
        'linear': function (p) {
            return p;
        },
        'custom': function (p, callback){
            return callback(p);
        },
        'pow': function (p, x) {
            return Math.pow(p, x);
        },
        'expo': function (p) {
            return Math.pow(2, 8 * (p - 1));
        },
        'circ': function (p) {
            return 1 - Math.sin(Math.acos(p));
        },
        'sine': function (p) {
            return 1 - Math.cos(p * Math.PI / 2);
        },
        'bounce': function (v) {
            var value,
                a = 0,
                b = 1;
            while (true) {
                if (v >= (7 - 4 * a) / 11) {
                    value = b * b - Math.pow((11 - 6 * a - 11 * v) / 4, 2);
                    break;
                }
                a += b;
                b /= 2;
            }
            return value;
        }
    }

    function transformFunction(options) {
        options = options || {};
        var name = options.name || 'linear',
            ease = options.ease || 'innout',
            param = options.param,
            func = transformations[name];

        if (ease === 'inn') {
            return function (v) {
                return func(v, param);
            };
        }
        if (ease === 'out') {
            return function (v) {
                return 1 - func(1 - v, param);
            };
        }
        return function (v) {
            if (v <= 0.5) {
                return func(2 * v, param) / 2;
            } else {
                return (2 - func(2 * (1 - v), param)) / 2;
            }
        };

    }

    function makeRandomGrid(options) {
        var height = options.gridHeight || 256,
            width = options.gridWidth || height,
            rand = options.random || Math.random,
            data = [],
            length = height * width,
            i = 0;

        while (i < length) {
            data[i] = rand();
            i += 1;
        }

        return function (x, y) {
            x = x % width;
            y = y % height;
            return data[y * width + x];

        };
    }

    function mix(a, b, weight) {
        return a * (1 - weight) + b * weight;
    }

    function noise(grid, transform) {
        return function (x, y) {
            var int_x = Math.floor(x),
                int_y = Math.floor(y),
                float_x = transform(x - int_x),
                float_y = transform(y - int_y),
                int_x2 = int_x + 1,
                int_y2 = int_y + 1;

            return mix(
                mix(
                    grid(int_x, int_y),
                    grid(int_x, int_y2),
                    float_y
                ),
                mix(
                    grid(int_x2, int_y),
                    grid(int_x2, int_y2),
                    float_y
                ),
                float_x
            );
        };
    }

    function fractalNoise(noise, options) {
        var layers = options.layers || 5,
            lacunarity = options.lacunarity || 2,
            gain = options.gain || 0.5;

        return function (x, y) {
            var frequency = 1,
                amplitude = 1,
                fractalNoise = 0,
                maxSum = 0,
                i = 0;

            while (i < layers) {
                maxSum += amplitude;
                fractalNoise += noise(x * frequency, y * frequency) * amplitude;
                amplitude *= gain;
                frequency *= lacunarity;
                i += 1;
            }

            // normalise the result
            return fractalNoise / maxSum;
        };
    }

    function angleMix(a, b, weight) {
        var out = 0;
        if (Math.abs(a - b) <= 180) {
            return mix(a, b, weight);
        }
        if (a > b) {
            b += 360;
        } else {
            a += 360;
        }

        out = mix(a, b, weight);
        if (out >= 360) {
            out -= 360;
        }
        return out;
    }

    function gradientFunc(options) {
        var colors = options.color || {0: "000000FF", 100: "FFFFFFFF"},
            keys = Object.getOwnPropertyNames(colors),
            length = keys.length;

        keys.forEach(function (key) {
            var color = colors[key],
                array = [];

            array[0] = parseInt(color.substring(0, 2), 16);
            array[1] = parseInt(color.substring(2, 4), 16);
            array[2] = parseInt(color.substring(4, 6), 16);
            array[3] = parseInt(color.substring(6, 8), 16);

            colors[key] = array;
        });

        keys = keys.map(parseFloat);
        keys.sort(function (a, b) {
            return a - b;
        });

        return function (value) {
            value *= 100;
            var i = 0,
                a,
                b;

            while (i < length - 1 && keys[i + 1] <= value) {
                i += 1;
            }

            value = (value - keys[i]) / (keys[i + 1] - keys[i]);
            a = colors[keys[i]];
            b = colors[keys[i + 1]];

            return a.map(function (item, index) {
                return mix(item, b[index], value);
            });
        };
    }

    game.textureBuilder = function (options) {
        options = options || {};
        var canvas = document.createElement('canvas'),
            height = options.height || 1024,
            width = options.width || height,
            xGain = options.xGain || 1 / 100,
            yGain = options.yGain || xGain,
            gradient = gradientFunc(options),
            grid = makeRandomGrid(options),
            mix = transformFunction(options.mix),
            transform = transformFunction(options.transform),
            noiseFunc = noise(grid, mix),
            fractal = fractalNoise(noiseFunc, options),
            paint = canvas.getContext('2d'),
            image = paint.createImageData(width, height),
            pixels = image.data,
            x = 0,
            y = 0,
            index = 0,
            noise_value = 0,
            rgba;

        while (y < height) {
            x = 0;
            while (x < width) {
                index = y * width * 4 + x * 4;
                noise_value = transform(fractal(x * xGain, y * yGain));
                rgba = gradient(noise_value);
                pixels[index] = rgba[0];
                pixels[index + 1] = rgba[1];
                pixels[index + 2] = rgba[2];
                pixels[index + 3] = rgba[3];
                x += 1;
            }
            y += 1;
        }

        canvas.height = height;
        canvas.width = width;
        paint.putImageData(image, 0, 0);

        return canvas.toDataURL();
    };
}(document, game));