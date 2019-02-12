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
    let linkBtn = document.getElementById("link-btn"); // Form Button forward
    let nextBtn = document.getElementById("next-btn"); // Form Button forward
    let prevBtn = document.getElementById("prev-btn"); // Form Button backwards
    let pdfBtn = document.getElementById("pdf-btn");
    let mailBtn = document.getElementById("mail-btn");
    let copyBtn = document.getElementById("copy-btn");

    let logo = document.querySelector(".logo");
    let bar = document.querySelector(".bar");
    let form = document.querySelector(".content");
    let logoSteps = logo.getElementsByClassName("step");
    let barSteps = bar.getElementsByClassName("step");
    let formSteps = form.getElementsByClassName("step");

    let pdfContainer = form.querySelector(".export.pdf");


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
        dates.forEach(datefield => {
            let today = new Date()
            if (datefield.name == 'lastdate') {
                let lastdate = new Date();
                lastdate.setDate(lastdate.getDate() - 30);
                datefield.valueAsDate = lastdate;
                datefield.max = formatDate(today, -27);
            } else {
                datefield.valueAsDate = today;
                datefield.min = formatDate(today, -3);
            }
        });


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
            // TODO: refactore and no hardcoded content in here
            nextBtn.innerHTML = "Anschreiben erstellen";
            nextBtn.disabled = false;
            prevBtn.style.display = "none";
            prevBtn.disabled = true;
            if (linkBtn) {
                linkBtn.style.display = "inline-block";
                linkBtn.disabled = false;
            }

        }
        else if (n == maxStep) {
            nextBtn.innerHTML = "weiter";
            nextBtn.disabled = true;
            prevBtn.style.display = "inline-block";
            prevBtn.disabled = false;
            if (linkBtn) {
                linkBtn.style.display = "none";
                linkBtn.disabled = true;
            }
        } else {
            nextBtn.style.display = "inline-block";
            nextBtn.innerHTML = "weiter";
            nextBtn.disabled = false;
            prevBtn.style.display = "inline-block";
            prevBtn.disabled = false;
            if (linkBtn) {
                linkBtn.style.display = "none";
                linkBtn.disabled = true;
            }
        }
    }

    // calculates the current step (gets input by buttons 1/-1)
    function navBtn(n) {
        // TODO: Validate if Input is Required
        // let inputs = formSteps[currentStep].getElementsByTagName("input")
        // for (let index = 0; index < inputs.length; index++) {
        //     const input = inputs[index];
        //     if (input.dataset.validation == "required") {
        //         alert("input required")
        //     } else {
        //     }
        // }

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
        let content = entity.action.content
        // console.log(formData);
        // TODO: Formular nicht klonen 
        if ((!formData.city || !formData.zip || !formData.street) &&
            !(pdfContainer.firstChild.type == "fieldset")) {
            let itm = document.querySelector(".ident.curaddr");
            let cln = itm.cloneNode(true);
            pdfContainer.insertBefore(cln, pdfContainer.firstChild);
        } else {
            let text = preRender(formData, content);
            // TODO: hanle Adblocker and different Browser
            pdfMake.createPdf(layoutPDF(text)).download(content.name + ".pdf");

            buttonFeedback(pdfBtn, "PDF gespeichert!")
        }

    }

    function sendMail() {
        let formData = serializeArray(document.querySelector("form"));
        let content = entity.action.content
        let text = preRender(formData, content); let addr = entity.contact.mail;

        let sub = text.subject;
        let body = encodeURIComponent(text.body.join("\n"));
        window.location.href = `mailto:${addr}?subject=${sub}&body=${body}`
        // window.open(`mailto:${addr}?subject=${sub}&body=${body}`);

        buttonFeedback(mailBtn, "Mail geöffnet!")
    }

    function copyText() {
        let formData = serializeArray(document.querySelector("form"));
        let content = entity.action.content
        let text = preRender(formData, content);

        // create temp node to copy text from
        let letter = text.subject.join(" ") + "\n\n"
        letter += text.body.join("\n");
        let el = document.createElement("textarea");
        el.value = letter;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);

        buttonFeedback(copyBtn, "Text kopiert!")
    }

    ////////////////////////////////////////////////////////////////////////////
    // HELPER FUNCTIONS
    ////////////////////////////////////////////////////////////////////////////

    function buttonFeedback(btn, msg) {
        let defaultText = btn.innerText;
        let defaultTimeout = 3000;
        // feedback for user
        btn.innerText = msg;
        btn.classList.add('interacted');
        setTimeout(function () {
            btn.innerText = defaultText;
            btn.classList.remove('interacted');
        }, defaultTimeout);
    }

    // https://plainjs.com/javascript/ajax/serialize-form-data-into-an-array-46/
    function serializeArray(form) {
        let s = [];
        if (typeof form == 'object' && form.nodeName == "FORM") {
            let len = form.elements.length;
            for (let i = 0; i < len; i++) {
                let field = form.elements[i];
                // && field.type != 'file'
                if (field.name && !field.disabled && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
                    if (field.type == 'select-multiple') {
                        let l = form.elements[i].options.length;
                        for (j = 0; j < l; j++) {
                            if (field.options[j].selected)
                                // s[s.length] = {[field.name]: field.options[j].value };
                                s[field.name] = field.options[j].value;
                        }
                    } else if (field.type == "date") {
                        // s[field.name] = formatDate(new Date(field.value));
                        s[field.name] = field.value;
                    }
                    else if (field.type == "file" && field.files[0]) {
                        // let FR = new FileReader();
                        // FR.addEventListener("load", function (e) {
                        //     s[field.name] = e.target.result;
                        //     console.log(e.target.result);
                        // });
                        // FR.readAsDataURL(field.files[0]);
                        s[field.name] = 'Siehe Anhang';
                    }
                    else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
                        // s[s.length] = { [field.name]: field.value };
                        s[field.name] = field.value;
                    }
                }
            }
        }
        console.log(s);
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

        // return dd + '.' + mm + '.' + yyyy;
        return yyyy + '-' + mm + '-' + dd;
    }

    ///////////////////////////////////////////////////////////////////////////
    // PDF/LETTER Methods
    ////////////////////////////////////////////////////////////////////////////

    // converts simple pdfMake stack with added style tag per item
    function addStyle(stack, tag) {
        let temp = []
        // [{text: "Sehr geehrte Damen und Herren,", style:"tag"}]
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
                    stack: doc.ident,
                    style: 'subject'
                },
                {
                    stack: addStyle(doc.body, 'paragraph'),
                    style: 'text'
                },
                {
                    image: doc.canvas,
                    width: (500 / 4),
                    height: (200 / 4)
                },
                {
                    canvas:
                        [
                            {
                                type: 'line',
                                x1: 0, y1: 30,
                                x2: 200, y2: 30,
                                lineWidth: 0.5,
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
        if (doc.attachment) {
            let att = { image: doc.attachment, pageBreak: 'before' }
            docLayout.content.push(att)
        }
        return docLayout;
    }

    // fill docDefinition 'd' with Letter and FormData from User 'f'
    // TODO: refactore here
    function preRender(f = [], c = {}) {

        let d = { "from": [], "date": [], "to": [], "subject": [], "ident": [], "body": [], "canvas": "", "signature": [], "attachment": "" };

        d.from.push(f.name || "... ... Name", f.street || "... ... Straße", f.city || "... ... Stadt");
        d.date.push((f.place || "... ... ") + " " + (formatDate(f.date)));
        if (entity.contact.hasOwnProperty('address')) {
            d.to.push(...entity.contact.address.formatted_address.split(/\s*;\s*/));
        } else {
            d.to.push("... ... Adresse");
        }
        d.subject.push(...c.subject.content);
        d.ident.push(f.ident || "... ... Identifikation");
        c.letter.forEach(key => {
            let type = c[key].type;
            if (type == "letter") {
                d.body.push(...c[key].content);
            }
            else if (type == "user") {
                c[key].content.forEach(item => {
                    if (item.input == "checkbox" && f[item.name]) {
                        d.body.push(f[item.name]);
                        // catch nested special case in DB Datenübertragung
                        if (item.content) {
                            d.body.push(f[item.content.name]);
                        }
                    }
                });
            }
            else if (type == "deadline") {
                d.body.push(formatDate(f.date, c[key].content));
            }
        });

        // signature input with mouse
        d.canvas = document.getElementById('signature-canvas').toDataURL("image/png");
        d.signature.push((f.place || "... ... Ort") + " " + (formatDate(f.date)), ...f.name);

        // d.attachment = f.ident || false;

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