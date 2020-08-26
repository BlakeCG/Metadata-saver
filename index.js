const express = require('express');
const Parser = require('icecast-parser');
const timestamp = require('time-stamp');
const url = require('./config/url');
const db = require('./config/database');
const fs = require('fs');
const app = express();
let currentlyPlaying = {};

// let json = JSON.stringify(songHistory);
// Time and date Functions
let currentDate = function getDate() {
  return timestamp();
};
let currentTime = function getTime() {
  return timestamp('HH:mm:ss');
};

// DataBase Excution
// db.execute('SELECT * FROM SongHistory')
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// MetaData setup
const radioStation = new Parser({
  url: url.ADRescape, // URL to radio station
  userAgent: 'Parse-Icy', // userAgent to request
  keepListen: false, // don't listen radio station after metadata was received
  autoUpdate: true, // update metadata after interval
  errorInterval: 10 * 60, // retry connection after 10 minutes
  emptyInterval: 5 * 60, // retry get metadata after 5 minutes
  metadataInterval: 30, // update metadata after 30 seconds
});

function save(songContent) {
  fs.readFile('history.json', (err, fileContent) => {
    console.log('readfile error', err);

    let songHistory = []; // readying up a empty array.
    let lastSongInHistory = {};

    if (!err) {
      // songContent is an object with data from the most recently played song.
      // If History.json exists it will open it then save it's data in songHistory
      // it will then Parse it to be able to add new data.
      songHistory = JSON.parse(fileContent);
    }
    lastSongInHistory = songHistory[songHistory.length - 1];

    if (lastSongInHistory.nowPlaying !== songContent.nowPlaying) {
      songHistory.push(songContent);
      // If songHistory.Json has items/objects already inside the JSON file
      // It will add the new data from songContent to the end of the array of songHistory

      db.execute(
        'INSERT INTO SongHistory (songtitle, date, time) VALUES (?, ?, ?)',
        [songContent.nowPlaying, songContent.date, songContent.time]
      )
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });

      // fs.writeFile(
      //   'history.json',
      //   JSON.stringify(songHistory, null, 2),
      //   (err) => {
      //     console.log(err);
      //   }
      // );
    }
    // if
    // Last song played != last song in file.
    // Run line 51.
  });
}

// Getting metadata and console logging it
radioStation.on('metadata', function (metadata) {
  let currentSong = function getSong() {
    return metadata.StreamTitle;
  };
  currentlyPlaying.nowPlaying = currentSong();
  // currentlyPlaying.flavorText = 'is playing on Ascendance Radio';
  currentlyPlaying.date = currentDate();
  currentlyPlaying.time = currentTime();
  // Now use fs.readfile to read history.json. Store the file contents into a array.
  // Read the last element in the array and store it as a variable.
  // Then compare it to currentlyplaying.nowPlaying
  // If they are the same do nothing.
  // If they are different run the save function.
  // TODO: Keeping this single threaded won't scale +bug

  save(currentlyPlaying);
});

// Route to display object
app.get('/', (req, res) => {
  res.send(currentlyPlaying);
});

// Auto setting port from server or set to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT);
