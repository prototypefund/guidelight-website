(function (window, document, undefined) {
    'use strict';

    ////////////////////////////////////////////////////////////////////////////
    // GLOBAL VARIABLES
    ////////////////////////////////////////////////////////////////////////////
    let currentStep; // current step in form creation
    let maxStep; // number of steps in form

    ////////////////////////////////////////////////////////////////////////////
    // SELECTORS
    ////////////////////////////////////////////////////////////////////////////
    let nextBtn = document.getElementById("nextBtn"); // Form Button forward
    let prevBtn = document.getElementById("prevBtn"); // Form Button backwards

    let logo = document.querySelector(".logo");
    let bar = document.querySelector(".bar");
    let form = document.querySelector(".content");

    let logoSteps = logo.getElementsByClassName("step");
    let barSteps = bar.getElementsByClassName("step");
    let formSteps = form.getElementsByClassName("step");


    ////////////////////////////////////////////////////////////////////////////
    // METHODS
    ////////////////////////////////////////////////////////////////////////////
    // gets called on window load and initialises the form
    function initForm() {
        currentStep = 0; // set global counter to first step
        maxStep = formSteps.length - 1; // global variable with highest index
        // init each item in breadcrumb nav menu with correct step number
        for (let i = 0; i < maxStep; i++) {
            (function (step) {
                logoSteps[i].onclick = () => {
                    currentStep = step; // change global counter onclick
                    showStep(step); // show clicked step
                }
            })(i);
        }
        // overwrite pageload with first step in form
        console.log("replaced pageload with state step: " + currentStep);
        history.replaceState({ "step": currentStep }, "", "");
        // finally show first step
        showStep(currentStep);
    }

    // showStep() on history state changes (e.g. back- forwardbutton clicked)
    function stateChange(event) {
        // console.log(event);
        if (event.state) {
            // history changed because of pushState/replaceState
            console.log("state changed to step: " + event.state.step);
            showStep(event.state.step)
        }
    }

    // display the specified step of the form
    function showStep(n) {
        for (let i = 0; i < formSteps.length; i++) {
            logoSteps[i].classList.remove('current');
            barSteps[i].style.display = "none";
            formSteps[i].style.display = "none";
        }
        logoSteps[n].classList.add('current');
        barSteps[n].style.display = "block";
        formSteps[n].style.display = "block";

        // manage "weiter" und "zurück" button 
        if (n == 0) {
            nextBtn.disabled = false;
            prevBtn.disabled = true;
        }
        else if (n == maxStep) {
            nextBtn.disabled = true;
            prevBtn.disabled = false;
        } else {
            nextBtn.disabled = false;
            prevBtn.disabled = false;
        }
    }

    // calculates the current step (gets input by buttons 1/-1)
    function nextPrev(n) {
        currentStep += n;
        // for navigation add new state to history 
        console.log("pushed new state step: " + currentStep);
        history.pushState({ "step": currentStep }, "", "");
        // display current step
        showStep(currentStep);
    }

    ////////////////////////////////////////////////////////////////////////////
    // HELPER FUNCTIONS
    ////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////
    // EVENTS/APIs/INIT
    ////////////////////////////////////////////////////////////////////////////
    window.onload = initForm;
    window.onpopstate = stateChange;
    nextBtn.addEventListener('click', function () { nextPrev(1); }, false);
    prevBtn.addEventListener('click', function () { nextPrev(-1); }, false);



})(window, document);