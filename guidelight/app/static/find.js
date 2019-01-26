(function (window, document, undefined) {
    'use strict';

    ////////////////////////////////////////////////////////////////////////////
    // SELECTORS
    ////////////////////////////////////////////////////////////////////////////
    let findBtn = document.getElementById("form-btn"); // Form Button "find"
    let findBar = document.getElementById("form-text");
    let entities = document.getElementsByClassName("entity");

    ////////////////////////////////////////////////////////////////////////////
    // METHODS
    ////////////////////////////////////////////////////////////////////////////
    function sortList(evt) {
        let query = findBar.value.toLowerCase();
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let name = entity.dataset.name;
            if (name.toLowerCase().indexOf(query) > -1) {
                entity.style.display = "";
            } else {
                entity.style.display = "none";
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    // HELPER FUNCTIONS
    ////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////
    // EVENTS/APIs/INIT
    ////////////////////////////////////////////////////////////////////////////
    window.onload = sortList;
    findBtn.addEventListener('click', sortList, false);
    findBar.addEventListener('input', sortList, false);
    // findBar.oninput = () => console.log("input");


})(window, document);