// Based on:
// https://www.codicode.com/art/how_to_draw_on_a_html5_canvas_with_a_mouse.aspx
(function (window, document, undefined) {
    'use strict';

    ////////////////////////////////////////////////////////////////////////////
    // GLOBAL VARIABLES
    ////////////////////////////////////////////////////////////////////////////
    let mouseIsPressed = false;
    let lastX, lastY;

    ////////////////////////////////////////////////////////////////////////////
    // SELECTORS
    ////////////////////////////////////////////////////////////////////////////
    let clear = document.getElementById('signature-clear');
    // let save = document.getElementById('save');
    let ctx = document.getElementById('signature-canvas').getContext("2d");
    let canvas = document.getElementById('signature-canvas');

    ////////////////////////////////////////////////////////////////////////////
    // METHODS
    ////////////////////////////////////////////////////////////////////////////
    function setup(e) {
        let h = parseInt(canvas.getAttribute("height"));
        let w = parseInt(canvas.getAttribute("width"));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
    }

    function mousePressed(e) {
        mouseIsPressed = true;
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left; //x position within the element.
        let y = e.clientY - rect.top;  //y position within the element.
        draw(x, y, false)
    }

    function mouseReleased(e) {
        mouseIsPressed = false;
    }

    function mouseDragged(e) {
        if (mouseIsPressed) {
            let rect = e.target.getBoundingClientRect();
            let x = e.clientX - rect.left; //x position within the element.
            let y = e.clientY - rect.top;  //y position within the element.
            draw(x, y, true)
        }
    }

    function draw(x, y, isDown) {
        if (isDown) {
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = "3";
            ctx.lineJoin = "round";
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.stroke();
        }
        lastX = x;
        lastY = y;
    }

    function clearImage() {
        // Use the identity matrix while clearing the canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    function saveImage(params) {
        let img = canvas.toDataURL("image/png");
        console.log(img);
    }

    ////////////////////////////////////////////////////////////////////////////
    // EVENTS/APIs/INIT
    ////////////////////////////////////////////////////////////////////////////
    // window.onload = setup;

    clear.addEventListener('click', clearImage, false);
    // save.addEventListener('click', saveImage, false);

    canvas.addEventListener('mousedown', mousePressed, false);
    canvas.addEventListener('mousemove', mouseDragged, false);
    canvas.addEventListener('mouseup', mouseReleased, false);
    canvas.addEventListener('mouseleave', mouseReleased, false);

})(window, document);