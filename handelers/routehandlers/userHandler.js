/*
 *
 *Title: user  Handler.
 *Description:  Hanlder to handle user related routes   .
 *Author: Sultan Ahmed Sanjar .
 *Date : 06-may-2023.
 *
 */

// dependencies

const data = require('../../lib/data');

const { hash } = require('../../helpers/utilites');
const { parseJson } = require('../../helpers/utilites');
const tokenhandler = require('./tokenHandler');
/*const path = require('path');
const { user } = require('../../route');*/

// module scaff hoding

const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const aceptedMethods = ['get', 'post', 'put', 'delete'];

  if (aceptedMethods.indexOf(requestProperties.method) > -1) {
    handler.Users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

// another scaff holder method

handler.Users = {};

// for post function
handler.Users.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === 'string' &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === 'string' &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
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
  const tosAgreement =
    typeof requestProperties.body.tosAgreement === 'boolean' &&
    requestProperties.body.tosAgreement === true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure the user doesn't have already been added to the db
    data.read('users', phone, err => {
      if (err) {
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        // store user data to db
        data.create('users', phone, userObject, err => {
          if (!err) {
            callback(200, {
              massage: 'user created successfully',
            });
          } else {
            callback(500, {
              error: 'could not create user',
            });
          }
        });
      } else {
        callback(400, {
          error: 'user already exists',
        });
      }
    });
  } else {
    callback(400, {
      error: 'there something wrong in your request object ',
    });
  }
};

// for get function
handler.Users.get = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryString.phone === 'string' &&
    requestProperties.queryString.phone.trim().length === 11
      ? requestProperties.queryString.phone
      : false;
  if (phone) {
    // verify the user

    let token =
      typeof requestProperties.headerObjets.token === 'string'
        ? requestProperties.headerObjets.token
        : false;

    tokenhandler.token.verify(token, phone, tokenId => {
      if (tokenId) {
      } else {
        callback(403, {
          error: 'authentication failed',
        });
      }
    });

    // look up the user

    data.read('users', phone, (err, u) => {
      const user = { ...parseJson(u) };
      if (!err && user) {
        delete user.password;
        callback(200, user);
      } else {
        callback(404, {
          error: ' requested user  not found ',
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

handler.Users.put = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === 'string' &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === 'string' &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
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
  if (phone) {
    if (firstName || lastName || password) {
      // verify the user

      let token =
        typeof requestProperties.headerObjets.token === 'string'
          ? requestProperties.headerObjets.token
          : false;

      tokenhandler.token.verify(token, phone, tokenId => {
        if (tokenId) {
          // store the user up data to db
          data.read('users', phone, (err, uData) => {
            const userData = { ...parseJson(uData) };
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }

              // store to db

              data.update('users', phone, userData, () => {
                if (!err) {
                  callback(200, {
                    massage: 'user updated successfully',
                  });
                } else {
                  callback(500, {
                    error: 'could not update user',
                  });
                }
              });
            } else {
              callback(400, {
                error: 'you have a problem in your request ',
              });
            }
          });
        } else {
          callback(403, {
            error: 'authntication failed',
          });
        }
      });
    }
  } else {
    callback(400, {
      error: 'you havent updated anything ',
    });
  }
};

//@TODO: AUTHENTICATION;

handler.Users.delete = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryString.phone === 'string' &&
    requestProperties.queryString.phone.trim().length === 11
      ? requestProperties.queryString.phone
      : false;
  if (phone) {
    let token =
      typeof requestProperties.headerObjets.token === 'string'
        ? requestProperties.headerObjets.token
        : false;

    tokenhandler.token.verify(token, phone, tokenId => {
      if (tokenId) {
        data.read('users', phone, (err, userdata) => {
          if (!err && userdata) {
            data.delete('users', phone, err => {
              if (!err) {
                callback(200, {
                  massage: 'userdata deleted successfully',
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
        callback(403, {
          error: 'authentication failed',
        });
      }
    });
  } else {
    callback(400, {
      error: 'invalid phone number please try agian ',
    });
  }
};

module.exports = handler;
