/*
 *
 *Title: handle request response .
 *Description: Handle Request and response .
 *Author: Sultan Ahmed Sanjar .
 *Date : 06-may-2023.
 *
 */

// dependencies
const { StringDecoder } = require('string_decoder');
const url = require('url');
const routes = require('../route');
const {
  notFoundHandler,
} = require('../handelers/routehandlers/notFoundHandler');
const {parseJson} = require('./utilites')

// app object or  scaff holding
const handler = {};

handler.handleReqRes = (req, res) => {
  // get the url and parse it
  const parseUrl = url.parse(req.url, true);
  const path = parseUrl.pathname;
  const trimedpath = path.replace(/^\/+|\/+$/g, '');
  const method = req.method.toLowerCase();
  const queryString = parseUrl.query;
  const headerObjets = req.headers;

  const requestProperties = {
    parseUrl,
    path,
    trimedpath,
    method,
    queryString,
    headerObjets,
  };

  const decoder = new StringDecoder('utf-8');
  let realData = '';

  const choosenHandler = routes[trimedpath]
    ? routes[trimedpath]
    : notFoundHandler;

  // request handeling
  req.on('data', buffer => {
    realData += decoder.write(buffer);
  });

  req.on('end', () => {
    realData += decoder.end();
    requestProperties.body = parseJson(realData);

    // final result
  choosenHandler(requestProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      payload = typeof payload === 'object' ? payload : {};

      const payloadString = JSON.stringify(payload);

      // final response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });

  /*console.log(headerObjets);
  console.log(queryString);
  console.log(trimedpath);
  console.log(method); */

  // respose handle
  res.on('end', () => {
    console.log(' successfully sent request ');
  });
  /*console.log(headerObjets);
  console.log(queryString);
  console.log(trimedpath);
  console.log(method);*/
};

module.exports = handler;
