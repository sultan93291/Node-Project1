/*
 *
 *Title: Server Libary   .
 *Description: Server Related Files  .
 *Author: Sultan Ahmed Sanjar .
 *Date : 17-may-2023.
 *
 */

// dependencies

const http = require('http');
const { handleReqRes } = require('../helpers/helperReqRes.js');
const enviorment = require('../helpers/enviorment');

// server  object or module scaffholding

const server = {};

// configuration
server.config = {
  port: 3000,
};

// create server configuration

server.createServer = () => {
  const createServerVarriable = http.createServer(server.handleReqRes);
  createServerVarriable.listen(enviorment.port, () => {
    console.log(`listening on ${enviorment.port}`);
  });
};

// handle response

server.handleReqRes = handleReqRes;

// start server

server.init = () => {
  server.createServer();
};

module.exports = server;
