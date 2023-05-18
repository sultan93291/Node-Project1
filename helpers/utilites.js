/*
 *
 *Title: utilties .
 *Description: Important utilites function   .
 *Author: Sultan Ahmed Sanjar .
 *Date : 06-may-2023.
 *
 */

// dependencies
const crypto = require('crypto');
const { stringify } = require('querystring');
const enviorments = require('./enviorment');

//modules scafholding

const utilites = {};

// parse json to string

utilites.parseJson = jsonString => {
  let output;

  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }

  return output;
};

// hash string

utilites.hash = str => {
  if (typeof str === 'string' && str.length > 0) {
    let hash = crypto
      .createHmac('sha256', enviorments.secretKey)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

// create random  token id for user

utilites.createRandomstr = strLength => {
  let length = strLength;
  length = typeof strLength === 'number' && strLength > 0 ? strLength : false;
  if (length) {
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let output = '';
    for (let i = 1; i <= length; i += 1) {
      let randomChar = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      output += randomChar;
    }
    return output;
  } else {
    false;
  }
};

// export  module

module.exports = utilites;
