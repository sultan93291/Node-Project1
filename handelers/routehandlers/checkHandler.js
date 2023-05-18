/*
 *
 *Title: check Handler.
 *Description:  Hanlder to handle user defined checks    .
 *Author: Sultan Ahmed Sanjar .
 *Date : 11-may-2023.
 *
 */

// dependencies

const data = require('../../lib/data');
const { parseJson, createRandomstr } = require('../../helpers/utilites');
const tokenhandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/enviorment');
const { request } = require('http');

// module scaff hoding

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const aceptedMethods = ['get', 'post', 'put', 'delete'];

  if (aceptedMethods.indexOf(requestProperties.method) > -1) {
    handler.check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

// another scaff holder method

handler.check = {};

// for post function
handler.check.post = (requestProperties, callback) => {
  // validate inputs
  let protocol =
    typeof requestProperties.body.protocol === 'string' &&
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === 'string' &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;
  let method =
    typeof requestProperties.body.method === 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;
  let successCodes =
    typeof requestProperties.body.successCodes === 'object' &&
    requestProperties.body.successCodes instanceof Array > -1
      ? requestProperties.body.successCodes
      : false;
  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === 'number' &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;
  if (protocol && url && method && successCodes && timeoutSeconds) {
    const token =
      typeof requestProperties.headerObjets.token === 'string'
        ? requestProperties.headerObjets.token
        : false;
    // look up the user
    data.read('tokens', token, (err1, tokenData) => {
      if (!err1 && tokenData) {
        let userphone = parseJson(tokenData).phone;
        // look up the user data
        data.read('users', userphone, (err2, userData) => {
          if (!err2 && userData) {
            tokenhandler.token.verify(token, userphone, tokenisValid => {
              // we have to check it
              if (tokenisValid) {
                let userObject = parseJson(userData);
                let userChecks =
                  typeof userObject.checks === 'object' &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];
                if (userChecks.length < maxChecks) {
                  let checkId = createRandomstr(20);
                  let checkObject = {
                    id: checkId,
                    userphone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };
                  // save the object
                  data.create('checks', checkId, checkObject, err3 => {
                    if (!err3) {
                      // add check id to the users objects
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);
                      // save the new user data
                      data.update('users', userphone, userObject, err4 => {
                        if (!err4) {
                          // return the data about to the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: 'cannot update user data ',
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: 'theres someting wrong in server ',
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error: ' Max Checks reached  ',
                  });
                }
              } else {
                callback(403, {
                  error: 'Could not verify user ',
                });
              }
            });
          } else {
            callback(403, {
              error: 'user not found ! ',
            });
          }
        });
      } else {
        callback(403, {
          error: 'Authentication Problem!',
        });
      }
    });
  } else {
    callback(400, {
      error: 'bad request ',
    });
  }
};

// for get function
handler.check.get = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryString.id === 'string' &&
    requestProperties.queryString.id.trim().length === 20
      ? requestProperties.queryString.id
      : false;
  if (id) {
    data.read('checks', id, (err1, checkData) => {
      if (!err1 && checkData) {
        const phone = parseJson(checkData).userphone;
        const token =
          typeof requestProperties.headerObjets.token === 'string'
            ? requestProperties.headerObjets.token
            : false;

        // vefification needed in tommorow

        tokenhandler.token.verify(token, phone, tokenisValid => {
          if (tokenisValid) {
            callback(200, parseJson(checkData));
          } else {
            callback(403, {
              error: 'Authentication failed ',
            });
          }
        });
      } else
        500,
          {
            error: ' Cannot Read Unauthorized data  ',
          };
    });
  } else {
    callback(400, {
      error: 'you Have a Problem in your request ',
    });
  }
};

// for put function

handler.check.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  // validate inputs
  let protocol =
    typeof requestProperties.body.protocol === 'string' &&
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === 'string' &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;
  let method =
    typeof requestProperties.body.method === 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;
  let successCodes =
    typeof requestProperties.body.successCodes === 'object' &&
    requestProperties.body.successCodes instanceof Array > -1
      ? requestProperties.body.successCodes
      : false;
  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === 'number' &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || method || url || successCodes || timeoutSeconds) {
      data.read('checks', id, (err1, checkData) => {
        if (!err1 && checkData) {
          const phone = parseJson(checkData).userphone;
          const userData = parseJson(checkData);
          const token =
            typeof requestProperties.headerObjets.token === 'string'
              ? requestProperties.headerObjets.token
              : false;
          tokenhandler.token.verify(token, phone, tokenisValid => {
            if (tokenisValid) {
              if (protocol) {
                userData.protocol = protocol;
              }
              if (url) {
                userData.method = url;
              }
              if (method) {
                userData.method = method;
              }
              if (timeoutSeconds) {
                userData.timeoutSeconds = timeoutSeconds;
              }
              if (successCodes) {
                userData.successCodes = successCodes;
              }

              // update the user updated data
              data.update('checks', id, userData, err2 => {
                if (!err2) {
                  callback(200, userData);
                } else {
                  callback(500, {
                    error: 'cannot update user data ',
                  });
                }
              });
            } else {
              callback(403, {
                error: ` Authentication Failed `,
              });
            }
          });
        } else {
          callback(500, {
            error: `server side problem `,
          });
        }
      });
    } else {
      callback(400, {
        error: `YOu have to provide atleast one infromation `,
      });
    }
  } else {
    callback(400, {
      error: 'Bad Request ',
    });
  }
};

//@TODO: AUTHENTICATION;

handler.check.delete = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryString.id === 'string' &&
    requestProperties.queryString.id.trim().length === 20
      ? requestProperties.queryString.id
      : false;
  if (id) {
    data.read('checks', id, (err1, checkData) => {
      if (!err1 && checkData) {
        const phone = parseJson(checkData).userphone;
        const token =
          typeof requestProperties.headerObjets.token === 'string'
            ? requestProperties.headerObjets.token
            : false;

        // vefification needed in tommorow

        tokenhandler.token.verify(token, phone, tokenisValid => {
          if (tokenisValid) {
            // delete the check data
            data.delete('checks', id, err2 => {
              if (!err2) {
                data.read('users', phone, (err3, userData) => {
                  let userObject = parseJson(userData);
                  if (!err3 && userData) {
                    let userChecks =
                      typeof userObject.checks === 'object' &&
                      userObject.checks instanceof Array
                        ? userObject.checks
                        : [];
                    let checkPostion = userChecks.indexOf(id);
                    if (checkPostion > -1) {
                      userChecks.splice(checkPostion, 1);
                      // resave the user data
                      userObject.checks = userChecks;
                      data.update('users', phone, userObject, err4 => {
                        if (!err4) {
                          callback(200);
                        } else {
                          callback(500, {
                            error: ` cannot update user data`,
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: 'check  id you enterd is inavalid',
                      });
                    }
                  } else {
                    callback(500, {
                      error: ` Theres something wrong in server side `,
                    });
                  }
                });
              } else {
                callback(500, {
                  error: 'Cannot delete checks . somehting wrong in server ',
                });
              }
            });
          } else {
            callback(403, {
              error: 'Authentication failed ',
            });
          }
        });
      } else
        500,
          {
            error: ' Cannot Read Unauthorized data  ',
          };
    });
  } else {
    callback(400, {
      error: 'you Have a Problem in your request ',
    });
  }
};

module.exports = handler;
