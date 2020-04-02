/*jshint -W119 */
/*jshint -W104 */


var app = angular.module('app', []);

app.controller('appCtrl', function ($scope, $q) {
  $scope.sort = -1;
  let url = '';
  $scope.compressedFormat = settings.compressed;
  $scope.noteList = null;

  function _loadNotesCallBack(deferred) {

    getCurrentTabUrl(function (_url) {
      url = _url;
      document.getElementById("note-area").focus();
      chrome.storage.sync.get(function (storedNotes) {
        if (!chrome.runtime.error) {
          _sortByDate(storedNotes.data);
          try {
            const urlHostName = url.match(/^(https?)\:\/\/[^\/]*(:[0-9]*)?/g);
            storedNotes.data.forEach((storedNote) => {
              const noteHostname = storedNote.url.match(/^(https?)\:\/\/[^\/]*(:[0-9]*)?/g);
              if (urlHostName && noteHostname && noteHostname[0].indexOf(urlHostName[0]) !== -1) {
                storedNote.isInUrl = true;
              } else {
                storedNote.isInUrl = false;
              }
            });

          } catch (err) {
            console.log(err);
          }
          $scope.noteList = storedNotes.data;
          if($scope.noteList.length < 2){
            $scope.compressedFormat = false;
          }
          deferred.resolve($scope.noteList); 
        }
      });
    });
  }

  function _loadNotes(reload) {
    let promise;
    if ($scope.noteList === null || reload) {
      var deferred = $q.defer();
      _loadNotesCallBack(deferred);
      promise = deferred.promise;
    } else {
      promise = $q.when($scope.noteList);
    }
    return promise;
  }

  function _reloadSnooze() {
    _reloadAlarm()
      .then((_gAlarms) => {
        $scope.gAlarms = _gAlarms;
      });
  }

  function _initialize() {
    /**Reload snooze */
    _reloadSnooze();
  }


  $scope.hoverIn = function () {
    this.hoverEdit = true;
  };

  $scope.hoverOut = function () {
    this.hoverEdit = false;
  };

  $scope.editable = function () {
    this.enableEdit = true;
  };

  $scope.nonEditable = function () {
    this.enableEdit = false;
  };

  $scope.returnUrlTooltip = function (url) {
    return url.length > 38 ? ("Open " + url).substring(0, 42) + '...' : "Open " + url;
  };

  $scope.loadUrl = function (url, event) {
    //if the middle button is not pushed (middle button returns 1) and the control key isnt pushed.
    if (event.button !== 1 && !event.ctrlKey)
      chrome.tabs.update(null, { url: url });
  };

  $scope.loadNotes = function () {
    return _loadNotes();
  };

  $scope.cancel = function () {
    /*  window.close(); */
    _viewAll();
  };

  function _sendTimerMessage(note) {
    let actionCommand = 'SET_TIMER';
    if ($scope.gAlarms[note.id]) {
      actionCommand = 'REMOVE_TIMER';
    }
    chrome.runtime.sendMessage({ cmd: actionCommand, time: settings.hours, note: note }, response => {
      _reloadAlarm()
        .then((_gAlarms) => {
          $scope.gAlarms = _gAlarms;
        });
    });
  }

  function _openMenu() {
  }

  function _handleNotificationClicked(note) {
    _openMenu();
  }

  function _setupBackgroundListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.cmd === 'NOTIFICATION_CLICKED') {

        _handleNotificationClicked(message.note);
      }
    });
  }

  _setupBackgroundListener();

  $scope.notifyNote = function (note) {
    _sendTimerMessage(note);
  };


  function _sortByDate(noteList) {
    noteList.sort((a, b) => ((a.date > b.date) ? (1 * $scope.sort) : (-1 * $scope.sort)));
  }

  $scope.sortByDate = function () {
    $scope.sort = -1 * $scope.sort;
    _sortByDate($scope.noteList);
  };

  $scope.viewAll = function () {
    _loadNotes();
    displayNoteList();
  };

  function _viewAll(reload) {
    _loadNotes(reload)
      .then(() => {
        if ($scope.noteList.length > 0) {
          displayNoteList();
        }
        _reloadAlarm()
          .then((_gAlarms) => {
            $scope.gAlarms = _gAlarms;
          });
      });
  }

  _viewAll();

  _initialize();

  $scope.viewCreateNote = function () {
    displayCreateNote();
    document.getElementById("note-area").focus();
  };

  $scope.noteIsSavable = function () {
    return document.getElementById("note-area").innerText;
  };

  $scope.showDate = function (note) {
    return new Date(note.date).toLocaleString();
  };

  function _saveNewNote(newNote, reload) {
    chrome.storage.sync.get(function (storedNotes) {
      if (typeof (storedNotes.data) !== 'undefined' && storedNotes.data instanceof Array) {
        storedNotes.data.unshift(newNote);
      } else {
        storedNotes.data = [newNote];
      }
      chrome.storage.sync.set(storedNotes, function () {
        if (chrome.runtime.error) {
          console.log("RuntimeError.");
        }
        if (reload) {
          _viewAll(reload);
        }
      });
    });
  }

  $scope.saveNote = function () {
    var noteText = document.getElementById("note-area").innerText;

    var newNoteData = {
      noteText: noteText,
      url: url,
      date: new Date().getTime(),
      id: new Date().getTime().toString()
    };

    _saveNewNote(newNoteData, true);
  };


  $scope.deleteNote = function (index) {
    chrome.storage.sync.get(function (storedNotes) {
      if (typeof (storedNotes.data) !== 'undefined' && storedNotes.data instanceof Array) {
        _removeAlarm(storedNotes.data[index].id);
        storedNotes.data.splice(index, 1);
      } else {
        console.log("Error, there were no notes to delete");
      }
      chrome.storage.sync.set(storedNotes, function () {
        if (chrome.runtime.error) {
          console.log("RuntimeError.");
        }
      });
    });
    return $scope.noteList.splice(index, 1);
  };

  function _editNote(note) {
    chrome.storage.sync.get(function (storedNotes) {
      storedNotes.data = $scope.noteList;
      chrome.storage.sync.set(storedNotes, function () {
        if (chrome.runtime.error) {
          console.log("RuntimeError.");
        }
      });
    });
  }

  $scope.editNote = function (note, index) {
    let noteText = document.getElementById("text" + index).innerText;
    note.noteText = noteText;
    _editNote(note);
  };

  $scope.focusOnEdit = function (index) {
    console.log("focus");
    window.setTimeout(function () {
      document.getElementById("text" + index).focus();
    }, 0);

  };

  $scope.updateToCurrentURL = function (note) {
    note.url = url;
    _editNote(note);
  };

  $scope.selectedColor = '';

  $scope.onChangeColor = function (selectedColor, notes) {
    notes.color = { 'background-color': selectedColor };

    _editNote(notes);
  };


}).directive('myDirective', [function () {
  return {
    restrict: 'E',
    replace: true,
    scope: { note: '=' },
    link: function (scope, element) {
      element.append(scope.note);
    }
  };
}]);

function displayNoteList() {
  document.getElementById('new-note').className += "display-nothing";
  document.getElementById('note-list').className =
    document.getElementById('note-list').className.replace(
      /(?:^|\s)display-nothing(?!\S)/g, ''
    );

}

function displayCreateNote() {
  if (document.getElementById('new-note').className != "display-nothing") {

  } else {
    document.getElementById('note-list').className += "display-nothing";
    document.getElementById('new-note').className =
      document.getElementById('new-note').className.replace(
        /(?:^|\s)display-nothing(?!\S)/g, ''
      );
  }
}



function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    var tab = tabs[0];

    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}