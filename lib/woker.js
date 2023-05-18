/*
 *
 *Title: wokers  Libary   .
 *Description: workers Related Files  .
 *Author: Sultan Ahmed Sanjar .
 *Date : 17-may-2023.
 *
 */

// dependencies
const data = require('./data');
const { parseJson } = require('../helpers/utilites');
const url = require('url');
const http = require('http');
const https = require('https');
const { sendTwiloSms } = require('.././helpers/notification');
const { parse } = require('path');

// workers object or module scaffholding

const worker = {};

// look up all the checks from data base
worker.gatherAllChecks = () => {
  // get all the checks
  data.list('checks', (err1, checks) => {
    if (!err1 && checks && checks.length > 0) {
      checks.forEach(check => {
        // read the check data
        data.read('checks', check, (err2, originalCheckData) => {
          if (!err2 && originalCheckData) {
            // pass data to the check validator
            worker.validateCheckData(parseJson(originalCheckData));
          } else {
            console.log('Error: Something went wrong with your check data ');
          }
        });
      });
    } else {
      console.log('Error could not find any checks for process ');
    }
  });
};

// validate individual loop data
worker.validateCheckData = originalCheckData => {
  if (originalCheckData && originalCheckData.id) {
    let originalData = originalCheckData;
    originalData.state =
      typeof originalCheckData.state === 'string' &&
      ['up', 'down'].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : 'down';
    originalData.lastChecked =
      typeof originalCheckData.lastChecked === 'number' &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;
    // pass to the next process
    worker.performCheck(originalData);
  } else {
    console.log('error:Check was invalid or not properly formatted ');
  }
};

// perform check
worker.performCheck = originalCheckData => {
  // prepare the initial check out come
  let checkOutCome = {
    error: false,
    responseCode: false,
  };
  // mark the outcome has not been sent yet
  let outComeSent = false;
  // parse the  host name && full url original data
  let parseUrl = url.parse(
    `${originalCheckData.protocol}://${originalCheckData.url}`,
    true
  );

  const hostName = parseUrl.hostname;
  const path = parseUrl.path;
  // construct the request
  const requestDetails = {
    protocol: `${originalCheckData.protocol}:`,
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  const ProtocolToUse = originalCheckData.protocol === 'http' ? http : https;
  let req = ProtocolToUse.request(requestDetails, res => {
    // grap the status of the response
    const status = res.statusCode;
    // update the check out come and pass to the next process
    checkOutCome.responseCode = status;
    console.log(status);

    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });

  // req end
  req.on('error', e => {
    // update the check out come and pass to the next process
    let checkOutCome = {
      error: true,
      value: e,
    };
    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    } else {
    }
  });
  // req timeout
  req.on('timeout', () => {
    let checkOutCome = {
      error: true,
      value: 'timeout',
    };
    // update the check out come and pass to the next process
    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    } else {
    }
  });
  req.end();
};

// process the check out come
worker.processCheckOutCome = (originalCheckData, checkOutCome) => {
  // check if check out come up or down

  let state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1
      ? 'up'
      : 'down';

  // decide whether we should alert the user or not
  let alertWanted = !!(
    originalCheckData.lastChecked && originalCheckData.state !== state
  );
  // update the check data

  let newCheckData = originalCheckData;

  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // update the check to list

  data.update('checks', newCheckData.id, newCheckData, err => {
    if (!err) {
      if (alertWanted) {
        // save the  data to next process
        worker.alertUserToStatusCheck(newCheckData);
      } else {
        console.log('Alert Not nedded because of state not changed yet ');
      }
    } else {
      console.log('error:trying to save data one of checks ');
    }
  });
};

// send notification sms to user if state changed
worker.alertUserToStatusCheck = newCheckData => {
  let msg = `Alert:Your Check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is currentyly ${newCheckData.state}`;

  sendTwiloSms(newCheckData.userphone, msg, err => {
    if (!err) {
      console.log(`user was alerted succcesfully via sms: ${msg}`);
    } else {
      console.log(
        'error: Something wrong happening while we are sending massage to the user !'
      );
    }
  });
};

// timer to execute the workers process once per minute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 8000);
};
// start the workers

worker.init = () => {
  // execute all the checks
  worker.gatherAllChecks();

  // call the loop so that checks continue
  worker.loop();
};

module.exports = worker;
