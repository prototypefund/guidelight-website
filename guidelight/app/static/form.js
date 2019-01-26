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
    let pdfBtn = document.getElementById("pdfBtn");
    let mailBtn = document.getElementById("mailBtn");
    let copyBtn = document.getElementById("copyBtn");

    let logo = document.querySelector(".logo");
    let bar = document.querySelector(".bar");
    let form = document.querySelector(".content");
    let logoSteps = logo.getElementsByClassName("step");
    let barSteps = bar.getElementsByClassName("step");
    let formSteps = form.getElementsByClassName("step");


    ////////////////////////////////////////////////////////////////////////////
    // METHODS FORM AND INIT
    ////////////////////////////////////////////////////////////////////////////
    // gets called on window load and initialises the form
    function initForm() {
        currentStep = 0; // set global counter to first step
        maxStep = formSteps.length - 1; // global variable with highest index


        // init each item in breadcrumb nav menu with correct step number
        for (let i = 0; i <= maxStep; i++) {
            (function (step) {
                logoSteps[i].onclick = () => {
                    currentStep = step; // change global counter onclick
                    showStep(step); // show clicked step
                }
            })(i);
        }

        // init date fields with today
        let dates = document.querySelectorAll("input[type=date]")
        dates.forEach(element => { element.valueAsDate = new Date(); });

        // overwrite pageload with first step in form
        // console.log("replaced pageload with state step: " + currentStep);
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
    // TODO: change the array style for navigation and make it secure
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
            nextBtn.innerHTML = "start";
            nextBtn.disabled = false;
            prevBtn.style.display = "none";
            prevBtn.disabled = true;
        }
        else if (n == maxStep) {
            // nextBtn.style.display = "none";
            nextBtn.disabled = true;
            prevBtn.style.display = "inline-block";
            prevBtn.disabled = false;
            // Trigger Summary
            // preRender();
        } else {
            nextBtn.style.display = "inline-block";
            nextBtn.innerHTML = "weiter";
            nextBtn.disabled = false;
            prevBtn.style.display = "inline-block";
            prevBtn.disabled = false;
        }
    }

    // calculates the current step (gets input by buttons 1/-1)
    function navBtn(n) {
        currentStep += n;
        // for navigation add new state to history 
        // console.log("pushed new state step: " + currentStep);
        history.pushState({ "step": currentStep }, "", "");
        // display current step
        showStep(currentStep);
    }

    ////////////////////////////////////////////////////////////////////////////
    // METHODS PDF/MAIL EXPORT
    ////////////////////////////////////////////////////////////////////////////
    function openPDF() {
        let formData = serializeArray(document.querySelector("form"));
        let docDefinition = { "from": [], "date": [], "to": [], "subject": [], "ident": [], "body": [], "signature": [] };
        let render = preRender(docDefinition, formData);
        // Create PDF 
        // TODO: hanle Adblocker and different Browser
        pdfMake.createPdf(layoutPDF(render)).download(content.name + ".pdf");
    }

    function sendMail() {
        // carriage return + line feed %0D%0A
        // white space %20
        let formData = serializeArray(document.querySelector("form"));
        let docDefinition = { "from": [], "date": [], "to": [], "subject": [], "ident": [], "body": [], "signature": [] };
        let render = preRender(docDefinition, formData);

        let addr = entity.contact.mail;
        let sub = render.subject;
        console.log(render.body.join("\n"));

        let body = encodeURIComponent(render.body.join("\n"));

        window.location.href = `mailto:${addr}?subject=${sub}&body=${body}`
        // window.open(`mailto:${addr}?subject=${sub}&body=${body}`);
    }

    function copyText() {
        let formData = serializeArray(document.querySelector("form"));
        let docDefinition = { "from": [], "date": [], "to": [], "subject": [], "ident": [], "body": [], "signature": [] };
        let render = preRender(docDefinition, formData);

        let letter = render.body.join("\n");
        const el = document.createElement("textarea");
        el.value = letter;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
    }

    ////////////////////////////////////////////////////////////////////////////
    // HELPER FUNCTIONS
    ////////////////////////////////////////////////////////////////////////////
    // https://plainjs.com/javascript/ajax/serialize-form-data-into-an-array-46/
    function serializeArray(form) {
        let s = [];
        if (typeof form == 'object' && form.nodeName == "FORM") {
            let len = form.elements.length;
            for (let i = 0; i < len; i++) {
                let field = form.elements[i];
                if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
                    if (field.type == 'select-multiple') {
                        let l = form.elements[i].options.length;
                        for (j = 0; j < l; j++) {
                            if (field.options[j].selected)
                                // s[s.length] = { [field.name]: field.options[j].value };
                                s[field.name] = field.options[j].value;
                        }
                    } else if (field.type == "date") {
                        // s[field.name] = formatDate(new Date(field.value));
                        s[field.name] = field.value;
                    }
                    else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
                        // s[s.length] = { [field.name]: field.value };
                        s[field.name] = field.value;
                    }
                }
            }
        }
        // console.log(s);
        return s;
    }

    function formatDate(d, offset) {
        let date = new Date(d)
        if (offset !== undefined) {
            date.setDate(date.getDate() + offset);
        }

        let dd = date.getDate();
        let mm = date.getMonth() + 1; //January is 0!
        let yyyy = date.getFullYear();

        dd = dd < 10 ? ('0' + dd) : dd;
        mm = mm < 10 ? ('0' + mm) : mm;

        return dd + '.' + mm + '.' + yyyy;
    }

    // converts simple pdfMake stack with added style tag per item
    function addStyle(stack, tag) {
        let temp = []
        // [{text:"Sehr geehrte Damen und Herren,", style:"tag"}]
        for (let index = 0; index < stack.length; index++) {
            const element = stack[index];
            temp.push({ text: element, style: tag })
        }
        return temp
    }

    function layoutPDF(doc) {
        let docLayout = {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: 75,
            content: [
                {
                    stack: doc.from,
                    style: ['right', 'addr']
                },
                {
                    stack: doc.to,
                    style: 'addr'
                },
                {
                    stack: doc.subject,
                    style: 'subject'
                },
                {
                    stack: addStyle(doc.body, 'paragraph'),
                    style: 'text'
                },
                {
                    canvas:
                        [
                            {
                                type: 'line',
                                x1: 0, y1: 60,
                                x2: 200, y2: 60,
                                lineWidth: 1,
                                lineCap: 'round'
                            },
                        ]
                },
                {
                    text: doc.date
                },
            ],
            styles: {
                addr: {
                    margin: [0, 24, 0, 24]
                },
                right: {
                    alignment: 'right'
                },
                subject: {
                    margin: [0, 24, 0, 24],
                    bold: true
                },
                text: {
                    alignment: 'justify',
                    margin: [0, 24, 0, 24]
                },
                paragraph: {
                    margin: [0, 0, 0, 6]
                }
            }
        }
        return docLayout;
    }

    function preRender(d, f) {
        // fill docDefinition with Letter and Userinfo
        d.from.push(f.name || "", f.street || "", f.city || "");
        d.date.push((f.place || "") + " " + (formatDate(f.date)));
        d.to.push(...entity.contact.address.formatted_address.split(/\s*;\s*/));
        d.subject.push(...content.subject.content);
        d.ident.push(...f.ident);
        content.letter.forEach(key => {
            let type = content[key].type;
            if (type == "letter") {
                d.body.push(...content[key].content);
            }
            else if (type == "user") {
                content[key].content.forEach(item => {
                    let input = item.input;
                    if (input == "checkbox") {
                        d.body.push(f[item.name] || "");
                    }
                });
            }
            else if (type == "deadline") {
                d.body.push(formatDate(f.date, content[key].content));
            }
        });
        d.signature.push((f.place || "") + " " + (formatDate(f.date)), ...f.name);

        // document.getElementById("summary").innerHTML = docDefinition;
        return d;
    }

    ////////////////////////////////////////////////////////////////////////////
    // EVENTS/APIs/INIT
    ////////////////////////////////////////////////////////////////////////////
    window.onload = initForm;
    window.onpopstate = stateChange;
    // EventListener for Buttons
    nextBtn.addEventListener('click', function () { navBtn(1); }, false);
    prevBtn.addEventListener('click', function () { navBtn(-1); }, false);
    pdfBtn.addEventListener('click', function () { openPDF(); }, false);
    mailBtn.addEventListener('click', function () { sendMail(); }, false);
    copyBtn.addEventListener('click', function () { copyText(); }, false);

})(window, document);