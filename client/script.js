// run the script after the page is loaded
window.onload = load;

let displayTerm = "";

function load() {
    document.querySelector("#search").onclick = searchButtonClick;
    setLimit();
}

// give the url based on the user's search
function searchButtonClick() {
    const YUGIOH_URL = "/getCardInfo?"
    document.querySelector("#content").innerHTML = `<p><i>No card found</i></p>`;

    let url = YUGIOH_URL;

    if (document.querySelector("#searchterm").value == "") {
        document.querySelector("#searchterm").value = document.querySelector("#searchterm").placeholder;
    }
    let term = document.querySelector("#searchterm").value;

    // store the term the user entered
    localStorage.setItem('term', document.querySelector("#searchterm").value);
    displayTerm = term;

    term = term.trim();

    term = encodeURIComponent(term);

    if (term.length < 1) return;

    url += "fname=" + term;

    let type = document.querySelector('input[name="type"]:checked').value;
    url += "&type=" + type;

    let limit = document.querySelector("#limit").value;

    // store the limit the user choose
    localStorage.setItem('limit', limit);

    url += "&num=" + limit + "&offset=0";

    console.log(url);

    getData(url);
}

// get data from the api
function getData(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoaded;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

// load the data and show it to the user 
function dataLoaded(e) {
    let xhr = e.target;

    console.log(xhr.responseText);

    let obj = JSON.parse(xhr.responseText);

    let results = obj.data;

    let bigstring = results.length === 0 ? "<p><i>No card found</i></p>" : "<p><i>Here are " + results.length + " results for '" + displayTerm + "'</i></p>";

    for (let i = 0; i < results.length; i++) {
        let result = results[i];

        let smallURL = result.card_images[0].image_url_small;

        let url = result.card_images[0].image_url;
        let name = result.name;

        let line = `<div class='result'><img src='${smallURL}' title= '${result.name}' />`;
        line += `<span><a target='_blank' href='${url}'>${name}</a></span></div>`;

        bigstring += line;
    }

    document.querySelector('#content').innerHTML = bigstring;
}

// error handler 
function dataError(e) {
    console.log("An erro occurred");
}

// set the default limit with the local storage
function setLimit() {
    if (localStorage.getItem('limit') != null) {
        document.querySelector("#limit").value = localStorage.getItem('limit');
    }
    if (localStorage.getItem('term') != null) {
        document.querySelector("#searchterm").placeholder = localStorage.getItem('term');
    }
}