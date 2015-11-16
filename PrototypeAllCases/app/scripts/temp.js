/**
 * Created by Nishant on 8/31/2015.
 */
function DrawCanvasCtrl($scope,$timeout, socket) {
    console.log('DrawCanvasCtrl ... ');

    var canvas = document.getElementById("drawCanvas");
    var clearButton = document.getElementById("clearDrawCanvas");


    function draw() {
        if (window.requestAnimationFrame) window.requestAnimationFrame(draw);
        // IE implementation
        else if (window.msRequestAnimationFrame) window.msRequestAnimationFrame(draw);
        // Firefox implementation
        else if (window.mozRequestAnimationFrame) window.mozRequestAnimationFrame(draw);
        // Chrome implementation
        else if (window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame(draw);
        // Other browsers that do not yet support feature
        else $timeout(draw, 16.7);
        DrawVideoOnCanvas();
    }

    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var paint;

    function addClick(x, y, dragging)
    {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }

    canvas.addEventListener("mousedown", function(e){
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;
        addClick(mouseX, mouseY);
        DrawVideoOnCanvas();

    });

    canvas.addEventListener("mousemove", function(e){
        if(paint){
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            DrawVideoOnCanvas();
        }
    });

    canvas.addEventListener("mouseup", function(e){
        paint = false;
    });

    canvas.addEventListener("mouseleave", function(e){
        paint = false;
    });

    clearButton.addEventListener("click", function(e){
        e.preventDefault();
        socket.emit('clearCanvas', 'clearCanvas');
    });

    draw();

    function DrawVideoOnCanvas() {
        //console.log('draw on canvas ...');
        var object;
        if ($scope.isInitiator) {
            object = document.getElementById("localVideo");
        } else {
            object = document.getElementById("remoteVideo");
        }

        var width = object.width;
        var height = object.height;

        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        if (canvas.getContext) {
            var context = canvas.getContext('2d');
            context.drawImage(object, 0, 0, width, height);
            var imgDataNormal = context.getImageData(0, 0, width, height);

            context.putImageData(imgDataNormal, 0, 0);

            context.strokeStyle = "#df4b26";
            context.lineJoin = "round";
            context.lineWidth = 5;

            for(var i=0; i < clickX.length; i++) {
                context.beginPath();
                if(clickDrag[i] && i){
                    context.moveTo(clickX[i-1], clickY[i-1]);
                }else{
                    context.moveTo(clickX[i]-1, clickY[i]);
                }
                context.lineTo(clickX[i], clickY[i]);
                context.closePath();
                context.stroke();
            }
        }
    }
};