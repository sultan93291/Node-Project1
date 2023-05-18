/*
 *
 *Title: Project Intitial File  .
 *Description: Intitial file the worker server ank workers  .
 *Author: Sultan Ahmed Sanjar .
 *Date : 05-may-2023.
 *
 */

// dependencies

const server = require('./lib/server');
const workers = require('./lib/woker');

// app object or module scaffholding

const app = {};

app.init = () => {
  // start the server
  server.init();
  //start the workers
  workers.init();
};

app.init();

module.exports = app;
