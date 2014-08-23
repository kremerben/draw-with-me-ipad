$(document).ready(function() {
    //Set up some globals
    var pixSize = 3, lastPoint = null, mouseDown = 0;
    var spreadStars = 1;

    var pixelDataRef = new Firebase('https://draw-with-me.firebaseio.com/');

    // SET UP CANVAS
    var myCanvas = document.getElementById('DrawCanvas');
    var myContext = myCanvas.getContext ? myCanvas.getContext('2d') : null;
    if (myContext == null) {
      alert("You must use a browser that supports HTML5 Canvas to run this demo.");
      return;
    }

    //SET BRUSH COLOR
    var currentColor = "black";
    $('.colorbox').on('click', function() {
        currentColor = $(this).data("bcolor");
    });

    //TRACK MOUSE UP DOWN
    myCanvas.onmousedown = function () {mouseDown = 1;};

    myCanvas.onmouseout = myCanvas.onmouseup = function () {
      mouseDown = 0; lastPoint = null;
      pixelDataRef.child('priorityCounter').set(priorityCounter);
    };

    pixelDataRef.child('priorityCounter').once('value', function(snapshot) {
        if (snapshot.val() === null) {
                priorityCounter = 1;
                pixelDataRef.child('priorityCounter').set(priorityCounter);
        } else {
                priorityCounter = snapshot.val();
        }
    });


//    function draw(event){
//       var coors = {
//          x: event.targetTouches[0].pageX,
//          y: event.targetTouches[0].pageY
//       };
//       drawer[event.type](coors);
//    }


    //Draw a line from the mouse's last position to its current position
    var drawLineOnMouseMove = function(e) {
      if (!mouseDown) return;

      e.preventDefault();

      var offset = $('canvas').offset();
      var x1 = Math.floor((e.pageX - offset.left))
      var y1 = Math.floor((e.pageY - offset.top));
      var x0 = (lastPoint == null) ? x1 : lastPoint[0];
      var y0 = (lastPoint == null) ? y1 : lastPoint[1];
      var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
      while (true) {
        //write the pixel into Firebase
        pixelDataRef.child(x0 + ":" + y0).setWithPriority([currentColor, getWidthSlider()], priorityCounter);
        priorityCounter++;

        if (x0 == x1 && y0 == y1) break;
        var e2 = 2 * err;
        if (e2 > -dy) {
          err = err - dy;
          x0 = x0 + sx;
        }
        if (e2 < dx) {
          err = err + dx;
          y0 = y0 + sy;
        }
      }
      lastPoint = [x1, y1];
    };
    $(myCanvas).mousemove(drawLineOnMouseMove);
    $(myCanvas).mousedown(drawLineOnMouseMove);
    myCanvas.addEventListener('touchstart',drawLineOnMouseMove, false);
    myCanvas.addEventListener('touchmove',drawLineOnMouseMove, false);
    myCanvas.addEventListener('touchend',drawLineOnMouseMove, false);


    // HIDE 'SAVE AS' BUTTON ON HOME PAGE
    if(location.pathname == '/'){
        $("#bt_saveAs").hide();
    }

    //BUILD BRUSH WIDTH SLIDER
    $(function() {
        console.log('this'+pixSize);
        $( "#slider" ).slider({
            value: pixSize,
            min:1,
            max:100,
            orientation: "horizontal",
            range: "min",
            animate: true,
            slide: function( event, ui ) {
                pixSize = $( "#slider" ).slider( "value" );
                $('#brushWidth').val(pixSize);
//                console.log("w"+pixSize);
            }
        });
    });

    function findPos(obj) {
        var curleft = 0, curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return { x: curleft, y: curtop };
        }
        return undefined;
    }

    function getWidthSlider() {
        pixSize = $( "#slider" ).slider( "option", "value");
        return pixSize;
    }

    var c=document.getElementById("DrawCanvas");
    var ctx=c.getContext("2d");
    ctx.lineWidth=pixSize;

    var xCur;
    var yCur;
    var xStart;
    var yStart;
    var startNewLine = true;

    // DRAWING STARS //
    function drawStar(options) {
      var length = 15;
      ctx.save();
      ctx.translate(options.x, options.y);
      ctx.beginPath();
      ctx.globalAlpha = options.opacity;
      ctx.rotate(Math.PI / 180 * options.angle);
      ctx.scale(options.scale, options.scale);
      ctx.strokeStyle = options.color;
      ctx.lineWidth = options.width;
      for (var i = 5; i--;) {
        ctx.lineTo(0, length);
        ctx.translate(0, length);
        ctx.rotate((Math.PI * 2 / 10));
        ctx.lineTo(0, -length);
        ctx.translate(0, -length);
        ctx.rotate(-(Math.PI * 6 / 10));
      }
      ctx.lineTo(0, length);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    // callbacks fired any time the pixel data changes and updates the canvas
    // child_added events fired on re+load
    var drawPixel = function(snapshot) {
        var coords = snapshot.name().split(":");
        strokeColor = snapshot.val()[0];
        myContext.fillStyle = strokeColor;
        pixSize = snapshot.val()[1];
        x00 = parseInt(coords[0]);
        y00 = parseInt(coords[1]);

        if (strokeColor == 'stars') {
            ctx.lineWidth = 1;
            if (spreadStars % (101-pixSize) === 0) {
                drawStar({x: x00,
                    y: y00,
                    angle: getRandomInt(0, 180),
                    width: getRandomInt(1, 10),
                    opacity: Math.random(),
                    scale: getRandomInt(1, 20) / 10,
                    color: ('rgb(' + getRandomInt(0, 255) + ',' + getRandomInt(0, 255) + ',' + getRandomInt(0, 255) + ')')
                });
            }
            spreadStars++;
        } else {
            myContext.fillRect(x00 - pixSize/2, y00 - pixSize/2, pixSize, pixSize);
        }
    };

    var clearPixel = function(snapshot) {
      var coords = snapshot.name().split(":");
      if (isNaN(snapshot.val()[1])) {
          pixSize = 1;
      } else {
          pixSize = snapshot.val()[1];
      }
      myContext.clearRect(parseInt(coords[0]), parseInt(coords[1]), pixSize, pixSize);
    };
    pixelDataRef.on('child_added', drawPixel);
    pixelDataRef.on('child_changed', drawPixel);
    pixelDataRef.on('child_removed', clearPixel);

//    $("#DrawCanvas").on("mousemove", function(e) {
//        ctx.lineWidth=getWidthSlider();
//        ctx.lineCap="round";
//
//        var pos = findPos(this);
//        var x = e.pageX - pos.x;
//        var y = e.pageY - pos.y;
//
//        if (startNewLine) {
//            xStart = x;
//            yStart = y;
//        }
//        ctx.beginPath();
//
//        ctx.strokeStyle=strokeColor;
//
//        if (e.which == 1) {
//            xEnd = x;
//            yEnd = y;
//
//            ctx.moveTo(xStart,yStart);
//            ctx.lineTo(xEnd,yEnd);
//
//            if (strokeColor == 'stars') {
//                ctx.lineWidth = 1;
//                drawStar({x: xEnd,
//                    y: yEnd,
//                    angle: getRandomInt(0, 180),
//                    width: getRandomInt(1, 10),
//                    opacity: Math.random(),
//                    scale: getRandomInt(1, 20) / 10,
//                    color: ('rgb(' + getRandomInt(0, 255) + ',' + getRandomInt(0, 255) + ',' + getRandomInt(0, 255) + ')')
//                });
//            }
//
//            xStart = xEnd;
//            yStart = yEnd;
//        }
//        ctx.stroke();
//        ctx.save();
//    });

    //$(document).on('click', '#saveImage', function(c) {
    ///* var c = document.getElementById("sketch"); */
    //    var dataString = c.toDataURL();
    //    document.getElementById('canvasImg').src = dataString;
    //    /* window.open(dataString); */
    //});

    $("#bt_draw").on('click', function() {
        document.getElementById("theimage").src = c.toDataURL();
    });

    //DOWNLOAD IMAGE TO COMPUTER
    function downloadCanvas(link, canvasId, filename) {
        link.href = document.getElementById(canvasId).toDataURL();
        link.download = filename;
    }

    document.getElementById('bt_download').addEventListener('click', function() {
        downloadCanvas(this, 'DrawCanvas', 'draw_with_me.png');
    }, false);

    //SAVE IMAGE TO SERVER
    $("#bt_saveLocal").on('click', function() {
        var image = c.toDataURL("image/png").replace("image/png", "image/octet-stream");
        // save canvas image as data url (default is png)
        var dataURL = c.toDataURL();
        // set canvasImg image src to dataURL
        // so it can be saved as an image
        document.getElementById('canvasImg').src = dataURL;

        var title = "Draw With Me";
        title = $("#imgTitle").val();

        // Added origin path because I'm using from another page
        url = window.location.origin + '/save_image/';
//        console.log(title);
        $.ajax({
            type: "POST",
            url: url,
            dataType: 'text',
            data: {
                base64data : dataURL,
                title: title
            }
        });
    });

    $('#clearCanvas').on('click', function() {
        ctx.clearRect(0, 0, c.width, c.height);
    });


});
