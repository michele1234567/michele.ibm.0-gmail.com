/*jshint -W119 */
/*jshint -W104 */

function _createAlarm(message) {
    const when = Date.now() + parseInt(message.time);
    const alarmId = message.note.id;
    chrome.alarms.create(alarmId, {
        when: when
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.cmd === 'SET_TIMER') {
        _createAlarm(message);
    } else if (message.cmd === 'REMOVE_TIMER') {
        _removeAlarm(message.note.id);
    }
    sendResponse({ hello: 'bye' });
});

function _createNotification(alarmNote) {
    chrome.notifications.create(alarmNote.id, {
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'My Note',
        message: alarmNote ? alarmNote.noteText : 'Note',
        buttons: [{ title: 'dismiss' }, { title: 'postpone' }]
    }, (notificationId) => {
        console.log('notification id is ', notificationId);
    });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {

    let alarmNote = await _loadNoteFromStore(alarm.name);
    if (alarmNote) {
        _createNotification(alarmNote);
    }
});

function _snoozeNote(alarmId) {
    chrome.alarms.create(alarmId, {
        when: Date.now() + settings.hours
    });
}

function _dismissAlarm(alarmId) {
    _updateNote({ id: alarmId, withAlarm: false });
}

chrome.notifications.onClicked.addListener((notificationId, buttonIndex) => {
    _dismissAlarm(notificationId);
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    console.log(buttonIndex);
    if (0 === buttonIndex) {
        _dismissAlarm(notificationId);
    } else if (1 === buttonIndex) {
        _snoozeNote(notificationId);
    }
});