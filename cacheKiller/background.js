/*jshint -W104 */
/*jshint -W069 */
/*jshint -W119 */



(function () {
    if (!localStorage["defaultSettingsUrl"]) {
        localStorage["defaultSettingsUrl"] = "http://chrome-cache-killer-defaults/";
    }

    let cachingEnabled = false;
    let alertThrown = false;
    let clearRunning = false;
    let filteredUrls = [];

    const clearCache = (function () {
        if (!clearRunning) {
            if (typeof (chrome.browsingData) !== 'undefined') {
                clearRunning = true;
                /* const oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek; */
                //Chrome 19:
                chrome.browsingData.remove({
                    "origins": filteredUrls
                }, {
                    "cache": true
                }, function () {
                    clearRunning = false;
                });
                /* clearRunning = false; */


            } else if (!alertThrown) {
                alertThrown = true;
                alert("Your browser does not support cache cleaning :(");
            }
        }
    });

    const enableCaching = (function () {
        cachingEnabled = true;
        chrome.browserAction.setIcon({ path: "icon-off.png" });
        chrome.browserAction.setTitle({ title: "Cache Killer disabled" });
        if (filteredUrls) {
            chrome.webRequest.onBeforeRequest.removeListener(clearCache);
        }
    });


    const disableCaching = (function () {
        cachingEnabled = false;
        chrome.browserAction.setIcon({ path: "icon-on.png" });
        chrome.browserAction.setTitle({ title: "Cache Killer enabled" });
        chrome.storage.sync.get(function (storedData) {
            filteredUrls = storedData.filteredUrls;
            if (filteredUrls) {
                chrome.webRequest.onBeforeRequest.addListener(clearCache, { urls: filteredUrls });
            }

        });

    });

    const flipStatus = (function () {
        if (cachingEnabled) {
            disableCaching();
        } else {
            enableCaching();
        }
    });

    chrome.browserAction.onClicked.addListener(flipStatus);

    if (localStorage && localStorage["turnOnByDefault"] && localStorage["turnOnByDefault"] === "on") {
        disableCaching();
    } else {
        enableCaching();
    }

    try {
        fetch(localStorage["defaultSettingsUrl"])
            .then(data => data.text())
            .then(data => {
                const settings = JSON.parse(data);

                if (settings.enableOnStart === true) {
                    disableCaching();
                }

                if (settings.enableOnStart === false) {
                    enableCaching();
                }
            });
    } catch (e) {
        console.log(e);
    }
})();
