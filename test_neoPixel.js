var five = require('johnny-five');
var pixel = require('node-pixel');

var board = new five.Board();

var fps = 10;
let bodyTemp;
let feverTemp = 36;

board.on('ready', function () {
  let temperature = new five.Thermometer({
    controller: 'LM35',
    // controller: 'TMP36',
    pin: 'A0',
    freq: 1000,
  });

  temperature.on('data', async () => {
    console.log(temperature.C);
    // console.log(temperature.F);
    // console.log(temperature.K);
    bodyTemp = temperature.C;
  });

  var strip = new pixel.Strip({
    // data: 6,
    length: 30,
    board: this,
    controller: 'I2CBACKPACK',
  });

  strip.on('ready', function () {
    console.log("Strip ready, let's go");

    var colors = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'white'];
    var current_colors = [0, 1, 2, 3, 4];
    var current_pos = [0, 1, 2, 3, 4];
    var blinker = setInterval(function () {
      strip.color('#000'); // blanks it out

      // for (var i = 0; i < current_pos.length; i++) {
      //   if (++current_pos[i] >= strip.length) {
      //     current_pos[i] = 0;
      //     if (++current_colors[i] >= colors.length) current_colors[i] = 0;
      //   }
      //   strip.pixel(current_pos[i]).color(colors[current_colors[i]]);
      // }
      if (bodyTemp >= feverTemp) {
        strip.color('#FF0000'); // blanks it out
        strip.show();
      }
      if (bodyTemp < feverTemp) {
        strip.color('#00FF00'); // blanks it out
        strip.show();
      }
      strip.show();
    }, 1000 / fps);
  });
  this.repl.inject({
    strip: strip,
    bodyTemp: bodyTemp,
  });
});
