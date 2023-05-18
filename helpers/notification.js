/*
 *
 *Title: Notification Libary  .
 *Description: Function for notify users  .
 *Author: Sultan Ahmed Sanjar .
 *Date : 15-may-2023.
 *
 */

// dependencies

const https = require('https');
const { twilio } = require('./enviorment');
const querystring = require('querystring');

// module scaff holding

const notification = {};

notification.sendTwiloSms = (phone, msg, callback) => {
  const userphone =
    typeof phone === 'string' && phone.trim().length === 11
      ? phone.trim()
      : false;
  const userMsg =
    typeof msg === 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;
  if (userphone && userMsg) {
    // configure the requested  paylaod
    const paylaod = {
      From: twilio.fromphone,
      To: `+880${userphone}`,
      Body: userMsg,
    };

    // stringify the payload
    const stringifyPayload = querystring.stringify(paylaod);
    // Configure the  request details

    const requestDetailsObject = {
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authtoken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    // instantiate the request object
    const req = https.request(requestDetailsObject, res => {
      // get the status of the requested code
      const status = res.statusCode;
      // callback successfully if the status went through
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(` Status code ${status}`);
      }
    });
    req.on('error', e => {
      callback(e);
    });

    req.write(stringifyPayload);
    req.end();
  } else {
    callback(500, {
      error: ` Given Parameters were missing or malformed`,
    });
  }
};

// export module
module.exports = notification;
