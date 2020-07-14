const express = require('express');
const Parser = require('icecast-parser');
const timestamp = require('time-stamp');
const url = require('./config/url');
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

// MetaData setup
const radioStation = new Parser({
  url: url.ADRescape, // URL to radio station
  userAgent: 'Parse-Icy', // userAgent to request
  keepListen: false, // don't listen radio station after metadata was received
  autoUpdate: true, // update metadata after interval
  errorInterval: 10 * 60, // retry connection after 10 minutes
  emptyInterval: 5 * 60, // retry get metadata after 5 minutes
  metadataInterval: 30, // update metadata after 10 seconds
});

function save(songContent) {
  fs.readFile('history.json', (err, fileContent) => {
    console.log(err);
    let songHistory = [];
    if (!err) {
      songHistory = JSON.parse(fileContent); //now it an object
    }
    songHistory.push(songContent); //add some data

    fs.writeFile(
      'history.json',
      JSON.stringify(songHistory, null, 2),
      (err) => {
        console.log(err);
      }
    );
  });
}

// Getting metadata and console logging it
radioStation.on('metadata', function (metadata) {
  let currentSong = function getSong() {
    return metadata.StreamTitle;
  };
  currentlyPlaying.nowPlaying = currentSong();
  currentlyPlaying.flavorText = 'is playing on Ascendance Radio';
  currentlyPlaying.date = currentDate();
  currentlyPlaying.time = currentTime();

  save(currentlyPlaying);
});

// Route to display object
app.get('/', (req, res) => {
  res.send(currentlyPlaying);
});

// Auto setting port from server or set to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT);
