


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


function _setColorToLabel(settings, row) {

    $(row).find("ul[class~='labels'] > li").each((index, li) => {
        const labelText = $(li).find("span").eq(0).text();
        const color = _findColor(settings.labels, labelText.toLowerCase());
        if (color) {
            $(li).find("a").css("backgroundColor", color.color);
        }
    });
}

function _findColor(settingColors, value) {
    const v = settingColors.find(color => color.text.toLowerCase() === value);
    return v === undefined ? null : v;
}

async function start() {
    const settings = await _loadSettings();

    var rowSelectors = ["tr[id*='issuerow']", "tr[data-issuekey]"];
    rowSelectors.forEach((rowSelector) => {
        $(rowSelector).each((index, row) => {
            const statusValue = $(row).find("td[class~='status'] > span").eq(0).text();
            const color = _findColor(settings.statuses, statusValue.toLowerCase());
            if (color) {
                $(row).css('backgroundColor', color.color);
            }
            /*  if (statusValue.toLowerCase() === 'Reopened') { $(row).css('backgroundColor', '#7ce66159'); }
             if (statusValue.toLowerCase() === 'code review') { $(row).css('backgroundColor', '#cbe6b1'); }
             if (statusValue.toLowerCase() === 'new') { $(row).css('backgroundColor', '#4fb7f359'); } */
            _setColorToLabel(settings, row);
        });
    });

}
console.log('MY JIRAAAA');
start();