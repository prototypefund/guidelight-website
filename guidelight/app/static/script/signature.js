// Based on:
// https://www.codicode.com/art/how_to_draw_on_a_html5_canvas_with_a_mouse.aspx
(function (window, document, undefined) {
    'use strict';

    ////////////////////////////////////////////////////////////////////////////
    // GLOBAL VARIABLES
    ////////////////////////////////////////////////////////////////////////////
    let mouseIsPressed = false;
    let mousePos = { x: 0, y: 0 };
    let lastPos = mousePos;

    ////////////////////////////////////////////////////////////////////////////
    // SELECTORS
    ////////////////////////////////////////////////////////////////////////////
    let clear = document.getElementById('signature-clear');
    // let save = document.getElementById('save');
    let canvas = document.getElementById('signature-canvas');
    let context = canvas.getContext("2d");


    ////////////////////////////////////////////////////////////////////////////
    // DRAWING METHODS
    ////////////////////////////////////////////////////////////////////////////
    function setup(evt) {
        let h = parseInt(canvas.getAttribute("height"));
        let w = parseInt(canvas.getAttribute("width"));
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, w, h);
    }

    function draw(currPos, isDown) {
        if (isDown) {
            context.beginPath();
            context.strokeStyle = "black";
            context.lineWidth = "3";
            context.lineJoin = "round";
            context.moveTo(lastPos.x, lastPos.y);
            context.lineTo(currPos.x, currPos.y);
            context.closePath();
            context.stroke();
        }
        lastPos = currPos;
    }

    ////////////////////////////////////////////////////////////////////////////
    // USER INPUT METHODS/EVENTS
    ////////////////////////////////////////////////////////////////////////////
    function mousePressed(evt) {
        mouseIsPressed = true;
        mousePos = getMousePos(evt);
        draw(mousePos, false)
    }

    function mouseReleased(evt) {
        mouseIsPressed = false;
    }

    function mouseDragged(evt) {
        if (mouseIsPressed) {
            mousePos = getMousePos(evt);
            draw(mousePos, true)
        }
    }

    function touchDown(evt) {
        mousePos = getTouchPos(evt);
        let touch = evt.touches[0];
        let mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }

    function touchUp(evt) {
        let mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    }

    function touchMove(evt) {
        let touch = evt.touches[0];
        let mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }

    ////////////////////////////////////////////////////////////////////////////
    // HELPER METHODS
    ////////////////////////////////////////////////////////////////////////////
    // prevent scrolling when touching the canvas
    // function touchCanvas(evt) {
    //     if (evt.target == canvas) {
    //         evt.preventDefault();
    //     }
    // }

    //  mouse position relative to the canvas
    function getMousePos(evt) {
        let rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    // touch position relative to the canvas
    function getTouchPos(touchEvt) {
        let rect = canvas.getBoundingClientRect();
        return {
            x: touchEvt.touches[0].clientX - rect.left,
            y: touchEvt.touches[0].clientY - rect.top
        };
    }

    function clearImage() {
        // Use the identity matrix while clearing the canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    function saveImage(params) {
        let img = canvas.toDataURL("image/png");
        console.log(img);
    }

    ////////////////////////////////////////////////////////////////////////////
    // EVENTS/APIs/INIT
    ////////////////////////////////////////////////////////////////////////////
    window.onload = setup;

    clear.addEventListener('click', clearImage, false);
    // save.addEventListener('click', saveImage, false);

    // handle mouse inputs inside canvas
    canvas.addEventListener('mousedown', mousePressed, false);
    canvas.addEventListener('mousemove', mouseDragged, false);
    canvas.addEventListener('mouseup', mouseReleased, false);
    canvas.addEventListener('mouseleave', mouseReleased, false);

    // handle touch inputs inside canvas
    canvas.addEventListener('touchstart', touchDown, false);
    canvas.addEventListener('touchmove', touchMove, false);
    canvas.addEventListener('touchend', touchUp, false);

    // IN CSS ON CANVAS 'touch-action: none' to prevent default
    // prevent scrolling on touch inside canvas
    // document.body.addEventListener("touchstart", touchCanvas, false);
    // document.body.addEventListener("touchend", touchCanvas, false);
    // document.body.addEventListener("touchmove", touchCanvas, false);

})(window, document);