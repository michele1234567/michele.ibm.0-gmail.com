/*jshint -W104 */
/*jshint -W119 */

let DEFAULT_SETTINGS = { hours: 1, compressed: true };

function _loadSettings() {
    let settings = Object.assign({}, DEFAULT_SETTINGS);
    if (window.localStorage.quicknotesettings) {
        let _settings = JSON.parse(window.localStorage.quicknotesettings);
        Object.assign(settings, _settings);
    }
    return settings;
}

function _displaySettingsValues(settings) {
    Object.keys(settings).forEach((key) => {
        if (key === 'compressed') {
            document.getElementById(key).checked = settings[key];
            document.getElementById("compressed_label").textContent = document.getElementById(key).checked ? 'Default view Compressed' : 'Default view Uncompressed';
        } else {
            document.getElementById(key).value = settings[key];
        }
    });
}

function _buildNewSettings(settings) {
    let newSettings = {};
    Object.keys(settings).forEach((key) => {
        if (key === 'compressed') {
            newSettings[key] = document.getElementById(key).checked;
        } else {
            newSettings[key] = document.getElementById(key).value;
        }
    });
    return newSettings;
}

function _saveSettings(settings) {
    let newSettings = _buildNewSettings(settings);

    window.localStorage.quicknotesettings = JSON.stringify(newSettings);
    window.location.reload(false);
    /* chrome.extension.getBackgroundPage().startOrRefresh(); */
}

function _resetSettings() {

    window.localStorage.quicknotesettings = JSON.stringify(DEFAULT_SETTINGS);
    window.location.reload(false);
    /* chrome.extension.getBackgroundPage().startOrRefresh(); */
}
window.onload = function () {
    const settings = _loadSettings();

    _displaySettingsValues(settings);

    document.getElementById("save").onclick = function () { _saveSettings(settings); };
    document.getElementById("reset").onclick = function () { _resetSettings(); };


};