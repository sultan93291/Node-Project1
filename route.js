/*
 *
 *Title: Routes .
 *Description: Application Routes  .
 *Author: Sultan Ahmed Sanjar .
 *Date : 05-may-2023.
 *
 */

// dependencies

const { sampleHandler } = require('./handelers/routehandlers/sampleHandler');
const { userHandler } = require('./handelers/routehandlers/userHandler');
const { tokenHandler } = require('./handelers/routehandlers/tokenHandler');
const { checkHandler } = require('./handelers/routehandlers/checkHandler');


const routes = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
  
};

module.exports = routes;
