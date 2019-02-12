(function (window, document, undefined) {
    'use strict';

    ////////////////////////////////////////////////////////////////////////////
    // SELECTORS
    ////////////////////////////////////////////////////////////////////////////
    let findBtn = document.getElementById("form-btn"); // Form Button "find"
    let findBar = document.getElementById("form-text");
    let findTags = document.getElementsByClassName("form-tags");
    let entities = document.getElementsByClassName("entity");

    ////////////////////////////////////////////////////////////////////////////
    // METHODS
    ////////////////////////////////////////////////////////////////////////////
    function findTag(evt) {
        findBar.value = evt.target.value;
        matchAll();
    }

    function matchAll() {
        // get querys from user input and split to array
        let querys = findBar.value.toLowerCase().split(" ")

        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let keywords = entity.dataset.searchable.toLowerCase();
            let hit = 0;
            querys.forEach(query => {
                if (keywords.indexOf(query) > -1) hit++;
            });
            if (hit == querys.length) {
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
    window.onload = matchAll;
    findBtn.addEventListener('click', matchAll, false);
    findBar.addEventListener('input', matchAll, false);
    for (let i = 0; i < findTags.length; i++) {
        findTags[i].addEventListener('click', findTag, false);
    }

})(window, document);