/*jshint -W119 */
/*jshint -W104 */

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
//const ONE_HOUR = 5 * ONE_SECOND; //FOR DEBUG;
const ONE_HOUR = 60 * ONE_MINUTE;

let settings = { hours: 1 * ONE_HOUR, compressed: true };
if (window.localStorage.quicknotesettings) {
    settings = JSON.parse(window.localStorage.quicknotesettings);
    settings.hours = parseInt(settings.hours) * ONE_HOUR;
}

function _findNote(note, storedNotes) {
    return storedNotes.find((_note) => _note.id === note.id);
}

async function _reloadAlarm() {
    return new Promise((resolve) => {
        let gAlarms = {};
        chrome.alarms.getAll((_alarms) => {
            _alarms.forEach(_alarm => {
                gAlarms[_alarm.name] = _alarm.name;
            });
            resolve(gAlarms);
        });
    });

}

function _updateNote(note) {
    chrome.storage.sync.get(function (storedNotes) {
        let storedNote = _findNote(note, storedNotes.data);
        if (storedNote) {
            storedNote = Object.assign(storedNote, note);
        }
        chrome.storage.sync.set(storedNotes, function () {
            if (chrome.runtime.error) {
                console.log("RuntimeError.");
            }
        });

    });
}

function _removeAlarm(alarmId) {
    chrome.alarms.clear(alarmId);
}

async function _loadNoteFromStore(noteId) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(function (storedNotes) {
            if (!chrome.runtime.error) {
                resolve(storedNotes.data.find((note) => { return note.id === noteId; }));
            } else {
                resolve(null);
            }
        });
    });
}