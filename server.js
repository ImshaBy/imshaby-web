/**
 * Created by Alena Misan on 03.07.2017.
 */

// server.js
const express = require('express');
const path = require('path');

const app = express();
// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/dist'));
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});

// Start the app by listening on the default
// Heroku port
app.listen(process.env.PORT || 8080);
