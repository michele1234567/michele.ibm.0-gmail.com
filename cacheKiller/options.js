/*jshint -W104 */
/*jshint -W069 */
/*jshint -W119 */

const addFilteredURLButton = document.getElementById("addFilteredURLButton");
const addFilteredURL = document.getElementById("addFilteredURL");
const save = document.getElementById("save");
const enableOnStartElement = document.getElementById("enableOnStartElement");
const defaultSettingsUrlElement = document.getElementById("defaultSettingsUrlElement");
const filteredUrlsElementTable = document.getElementById("filteredUrlElementTable");

function saveOptions() {

    let newValue = "off";
    if (enableOnStartElement.checked) {
        newValue = "on";
    }
    localStorage["turnOnByDefault"] = newValue;
    localStorage["defaultSettingsUrl"] = defaultSettingsUrlElement.value.trim();
}

function _removeAllFilteredUrls() {

    /* while (filteredUrlsElementTable.hasChildNodes()) { */
    while (filteredUrlsElementTable.children.length > 0) {
        filteredUrlsElementTable.removeChild(filteredUrlsElementTable.firstChild);
    }
}

function _rowContent(url) {
    const span = document.createElement('span');
    const div = document.createElement('div');
    const content = document.createTextNode(url);
    span.appendChild(content);
    const button = document.createElement('button');
    button.id = filteredUrlsElementTable.children.length;
    button.onclick = async function (e) {
        const index = e.srcElement.id;
        await _removeFilteredUrlAtIndex(index);
        _removeAllFilteredUrls();
        _loadFilteredUrls();
    };
    button.innerText = 'Remove';
    div.appendChild(span).appendChild(button);
    return div;

}

async function _removeFilteredUrlAtIndex(index) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(function (storedData) {
            let filteredUrls = storedData.filteredUrls;
            filteredUrls.splice(index, 1);
            let storeData = { filteredUrls: filteredUrls };
            chrome.storage.sync.set(storeData, function () {
                if (chrome.runtime.error) {
                    console.log("RuntimeError.");
                }
                resolve();
            });
        });
    });
}

function _addNewUrlToTable(url) {
    let tr = document.createElement('tr');
    let td = tr.appendChild(document.createElement('td'));
    td.appendChild(_rowContent(url));
    filteredUrlsElementTable.appendChild(tr);
}

function _loadFilteredUrls() {
    let filteredUrls = [];
    chrome.storage.sync.get(function (storedData) {
        filteredUrls = storedData.filteredUrls;

        if (filteredUrls) {
            filteredUrls.forEach((filteredUrl) => {
                _addNewUrlToTable(filteredUrl);
            });
        }
    });
}

function _saveFilteredUrls(_filteredUrl) {
    chrome.storage.sync.get(function (storedData) {

        let filteredUrls = storedData === undefined ? [] : storedData.filteredUrls;
        filteredUrls.push(_filteredUrl);
        let storeData = { filteredUrls: filteredUrls };
        chrome.storage.sync.set(storeData, function () {
            if (chrome.runtime.error) {
                console.log("RuntimeError.");
            }
        });
    });

}

// Restores select box state to saved value from localStorage.
function restoreOptions() {
    if (localStorage["turnOnByDefault"] === "on") {
        enableOnStartElement.checked = true;
    }

    defaultSettingsUrlElement.value = localStorage["defaultSettingsUrl"];

    _loadFilteredUrls();
}

save.addEventListener("click", saveOptions);

addFilteredURLButton.addEventListener("click", function _addFilteredUrl() {
    if(addFilteredURL.value === ''){
        alert('Please add URL');
        return;
    }
    _saveFilteredUrls(addFilteredURL.value);
    _addNewUrlToTable(addFilteredURL.value);
    addFilteredURL.value = '';
});
restoreOptions();
