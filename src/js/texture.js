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
    hue: [0],
    saturation: [0],
    value: [0 , 1],
    alfa: [1]
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

    function hsvToRgb(h, s, v) {
        var hi = Math.floor((h / 60) % 6),
            f = (h / 60) - hi,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            rgb = [];

        switch (hi) {
        case 0:
            rgb = [v, t, p];
            break;
        case 1:
            rgb = [q, v, p];
            break;
        case 2:
            rgb = [p, v, t];
            break;
        case 3:
            rgb = [p, q, v];
            break;
        case 4:
            rgb = [t, p, v];
            break;
        case 5:
            rgb = [v, p, q];
            break;
        }

        rgb[0] = Math.min(255, Math.round(rgb[0] * 256));
        rgb[1] = Math.min(255, Math.round(rgb[1] * 256));
        rgb[2] = Math.min(255, Math.round(rgb[2] * 256));

        return rgb;

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

    function gradient(value, array, hue) {
        var step = 1 / (array.length - 1),
            pos = Math.floor(value / step),
            out;
        value = value / step - pos;

        if (array.length === 1) {
            return array[0];
        }

        if (value === 0) {
            return array[pos];
        }

        if (hue) {
            return angleMix(array[pos], array[pos + 1], value);
        }
        return mix(array[pos], array[pos + 1], value);
    }

    game.textureBuilder = function (options) {
        options = options || {};
        var canvas = document.createElement('canvas'),
            height = options.height || 1024,
            width = options.width || height,
            xGain = options.xGain || 1 / 100,
            yGain = options.yGain || xGain,
            hue = options.hue || [0],
            saturation = options.saturation || [0],
            value = options.value || [0, 1],
            alfa = options.alfa || [1],
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
            rgb;

        while (y < height) {
            x = 0;
            while (x < width) {
                index = y * width * 4 + x * 4;
                noise_value = transform(fractal(x * xGain, y * yGain));
                rgb = hsvToRgb(
                    gradient(noise_value, hue, true),
                    gradient(noise_value, saturation),
                    gradient(noise_value, value)
                );
                pixels[index] = rgb[0];
                pixels[index + 1] = rgb[1];
                pixels[index + 2] = rgb[2];
                pixels[index + 3] = 255 * gradient(noise_value, alfa);
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