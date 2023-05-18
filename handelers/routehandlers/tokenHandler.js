/*
 *
 *Title: token handler  .
 *Description: it will authorize all login and registration   .
 *Author: Sultan Ahmed Sanjar .
 *Date : 08-may-2023.
 *
 */
// dependencies

const data = require('../../lib/data');

const { hash } = require('../../helpers/utilites');
const { createRandomstr } = require('../../helpers/utilites');
const { parseJson } = require('../../helpers/utilites');
const { callbackify } = require('util');

// module scaff hoding

const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const aceptedMethods = ['get', 'post', 'put', 'delete'];

  if (aceptedMethods.indexOf(requestProperties.method) > -1) {
    handler.token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

// another scaff holder method

handler.token = {};

// for post function
handler.token.post = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.body.phone === 'string' &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === 'string' &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone && password) {
    data.read('users', phone, (err, userData) => {
      let hashPassword = hash(password);
      if (hashPassword === parseJson(userData).password) {
        let tokenId = createRandomstr(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone,
          id: tokenId,
          expires,
        };

        // store the data to db

        data.create('tokens', tokenId, tokenObject, err => {
          if (!err) {
            callback(200, tokenObject);
          } else {
            callback(500, {
              error: 'something wrong in server response',
            });
          }
        });
      } else {
        callback(400, {
          error: 'password is incorrect ',
        });
      }
    });
  } else {
    callback(400, {
      error: 'you have a problem in your request ',
    });
  }
};

// for get function
handler.token.get = (requestProperties, callback) => {
  // check the token is valid
  const id =
    typeof requestProperties.queryString.id === 'string' &&
    requestProperties.queryString.id.trim().length === 20
      ? requestProperties.queryString.id
      : false;
  if (id) {
    // find out the token
    data.read('token', id, (err, tokenData) => {
      const token = { ...parseJson(tokenData) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, {
          error: ' requested token  not found ',
        });
      }
    });
  } else {
    callback(404, {
      error: ' requested user  not found ',
    });
  }
};



// for put function

handler.token.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;
  const extend =
    typeof requestProperties.body.extend === 'boolean' &&
    requestProperties.body.extend === true
      ? true
      : false;

  if (id && extend) {
    data.read('token', id, (err, tokendata) => {
      let tokenObject = parseJson(tokendata);
      if (tokenObject.expires > Date.now()) {
        tokenObject.expires = Date.now() + 60 * 60 * 1000;
        // store the updated token
        data.update('token', id, tokenObject, err => {
          if (!err) {
            callback(200);
          } else {
            callback(500, {
              error: 'something wrong in server response',
            });
          }
        });
      } else {
        callback(400, {
          error: 'token already expired ',
        });
      }
    });
  } else {
    callback(400, {
      error: 'theres a problem in your request ',
    });
  }
};


// for delete function
handler.token.delete = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.queryString.id === 'string' &&
    requestProperties.queryString.id.trim().length === 20
      ? requestProperties.queryString.id
      : false;
  if (id) {
    data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        data.delete('tokens', id, err => {
          if (!err) {
            callback(200, {
              massage: ' token  id deleted successfully',
            });
          } else {
            callback(500, {
              error: 'server side problem ',
            });
          }
        });
      } else {
        callback(500, {
          error: 'server side problem ',
        });
      }
    });
  } else {
    callback(400, {
      error: 'invalid token id  please try agian ',
    });
  }
};

// token verifier 

handler.token.verify = (id, phone, callback) => {
  data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJson(tokenData).phone === phone &&
        parseJson(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handler;

