/*jshint -W104 */
/*jshint -W119 */


let rowTemplateElement = null;

async function _loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(function (settings) {
            resolve(settings);
        });
    });
}

async function _saveSettings(settings) {
    return new Promise((resolve) => {
        chrome.storage.sync.set(settings, function () {
            resolve();
        });
    });
}

async function _removeColorFromSettings(color, settingType) {
    let settings = await _loadSettings();

    const index = settings[settingType].findIndex((_color) => _color.text === color.text);
    if (index !== undefined) {
        settings[settingType].splice(index, 1);
    }

    return settings;
}

function _getRow(color, settingType) {
    const tr = document.createElement('tr');
    const colorId = new Date().getTime();
    tr.innerHTML = '<td><input class="the_color" type="color" id="' + colorId + '" ></input><span class="the_label"></span><button class="the_remove">Remove</button></td>';

    const label = tr.getElementsByClassName('the_label')[0];

    label.textContent = color.text;
    const colorInputElement = tr.getElementsByClassName('the_color')[0];
    colorInputElement.value = color.color;
    const buttonRemoveElement = tr.getElementsByClassName('the_remove')[0];
    buttonRemoveElement.id = settingType;
    colorInputElement.addEventListener('change', async (event) => {
        let settings = await _loadSettings();
        for (let i = 0; i < settings[settingType].length; i++) {
            if (settings[settingType][i].text === color.text) {
                settings[settingType][i].color = event.target.value;
                await _saveSettings(settings);
                break;
            }
        }
    });
    buttonRemoveElement.onclick = async function () {
        tr.parentNode.removeChild(tr);
        settings = await _removeColorFromSettings(color, this.id);
        await _saveSettings(settings);
    };
    return tr;
}

async function _loadColors(colors, tableElement) {
    if (colors) {
        colors.forEach(async color => {
            let newRow = await _getRow(color, tableElement.id);
            tableElement.appendChild(newRow);
        });
    }
}

// settingType can be labels or statuses
function _reloadTable(settingType, settings) {
    const _tableElement = document.getElementById(settingType);
    while (_tableElement.children.length > 0) {
        _tableElement.removeChild(_tableElement.firstChild);
    }

    _loadColors(settings[settingType], _tableElement);

}

function _clear() {

    const textElement = document.getElementById("add_label");
    textElement.value = '';

}

async function _addColor() {
    const colorElement = document.getElementById("color");
    const textElement = document.getElementById("add_label");
    if (!textElement.value) {
        alert('pleaes add a label!!!');
        return;
    }
    const type = document.getElementById("type");
    const settingType = type.options[type.selectedIndex].value;
    let setting = { color: colorElement.value, text: textElement.value };

    let settings = await _loadSettings();
    if (!settings) {
        settings = {};
    }
    if (!settings[settingType]) {
        settings[settingType] = [];
    }
    settings[settingType].push(setting);
    await _saveSettings(settings);

    _reloadTable(settingType, settings);

    _clear();
}

async function _export() {
    const settings = await _loadSettings();
    alert(JSON.stringify(settings));
}

function _import(){
    const importFileElement = document.getElementById("import_file");
    var reader = new FileReader();
    reader.readAsText(importFileElement.files[0], 'UTF-8');
    reader.onload = async function (evt) {
        const fileContent = evt.target.result;
        await _saveSettings(fileContent);
    };
}

window.onload = async function () {
    rowTemplateElement = document.getElementById("rowTemplate");
    let settings = await _loadSettings();
    if (settings) {
        _loadColors(settings.statuses, document.getElementById("statuses"));
        _loadColors(settings.labels, document.getElementById("labels"));
    }

    document.getElementById("add_color").onclick = function () { _addColor(); };
    document.getElementById("export").onclick = function () { _export(); };
    document.getElementById("import").onclick = function () { _import(); };

};