/*
 *
 *Title: not found  Handler.
 *Description: Not Found  Handler  .
 *Author: Sultan Ahmed Sanjar .
 *Date : 05-may-2023.
 *
 */

// module scaff hoding

const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
  
  callback(404, {
    massage: ' Your requested payload is not available',
  });
};

module.exports = handler;
