/*
 *
 *Title: Sample Handler.
 *Description: Sample Handler  .
 *Author: Sultan Ahmed Sanjar .
 *Date : 05-may-2023.
 *
 */

// module scaff hoding

const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
  console.log(requestProperties);
  callback(200, {
    massage:'this is a sample request '
  });
};

module.exports = handler;
