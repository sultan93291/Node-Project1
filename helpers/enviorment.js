/*
 *
 *Title: Enviorments.
 *Description:Enviorment setup for all files  .
 *Author: Sultan Ahmed Sanjar .
 *Date : 05-may-2023.
 *
 */

const { env } = require('process');

// dependencies

//modules scafholding

const enviorments = {};

enviorments.staging = {
  port: 3000,
  envName: 'staging',
  secretKey: 'hidden',
  maxChecks: 5,
  twilio: {
    fromphone: '+18142564380',
    accountSid: 'AC4c652d07eab002459be235b5a2be9f1d',
    authtoken: 'a3e90d31dc6ffa8f4dacd8971cb57523',
  },
};

enviorments.production = {
  port: 5000,
  envName: 'production',
  secretKey: 'secret',
  maxChecks: 5,
  twilio: {
    fromPhone: '+18142564380',
    accountSid: 'AC4c652d07eab002459be235b5a2be9f1d',
    authToken: 'a3e90d31dc6ffa8f4dacd8971cb57523',
  },
};

// determine which environment was passed

const currentEnvironment =
  // changed for error -- 11:16
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corerespondig environment object
const environmentToExport =
  typeof enviorments[currentEnvironment] === 'object'
    ? enviorments[currentEnvironment]
    : enviorments.staging;

// export  module

module.exports = environmentToExport;
