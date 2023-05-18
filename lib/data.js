/*
 *
 *Title: data base .
 *Description:read and write data base hub   .
 *Author: Sultan Ahmed Sanjar .
 *Date : 05-may-2023.
 *
 */

// dependencies

const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');

// module scaffholding

const lib = {};

// base dierectory of the data folder

lib.baseDirectory = path.join(__dirname, '../.data/');

// write data to the data folder

lib.create = (dir, file, data, callback) => {
  // open file for writing data

  fs.open(
    `${lib.baseDirectory + dir}/${file}.json`,
    'wx',
    (err, fileDescreption) => {
      if (!err && fileDescreption) {
        // converting data to string

        const stringData = JSON.stringify(data);

        fs.writeFile(fileDescreption, stringData, err => {
          if (!err) {
            fs.close(fileDescreption, err => {
              if (!err) {
                callback(false);
              } else {
                callback('error  on written file . closing the file ');
              }
            });
          } else {
            callback('error writing on file! ');
          }
        });

        // write data to file and close it
      } else {
        callback(` something wrong maybe file  already exists!`);
      }
    }
  );
};

// read data from the data folder
lib.read = (dir, file, callback) => {
  fs.readFile(
    `${lib.baseDirectory + dir}/${file}.json`,
    'utf8',
    (err, data) => {
      callback(err, data);
    }
  );
};

// update existing files
lib.update = (dir, file, data, callback) => {
  // open file for writing data
  fs.open(
    `${lib.baseDirectory + dir}/${file}.json`,
    'r+',
    (err, fileDescreption) => {
      if (!err && fileDescreption) {
        // converting data to string
        const stringData = JSON.stringify(data);
        // truncate the file
        fs.ftruncate(fileDescreption, err => {
          if (!err) {
            // write data to file and close it
            fs.writeFile(fileDescreption, stringData, err => {
              if (!err) {
                // close the file
                fs.close(fileDescreption, err => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback('error while closing file ');
                  }
                });
              } else {
                callback('error on writing file');
              }
            });
          } else {
            callback('error on truncating file');
          }
        });
      } else {
        callback(
          `can't update files in ${lib.baseDirectory} . may be file deleted or renamed`
        );
      }
    }
  );
};

// delete existing files
lib.delete = (dir, file, callback) => {
  // unlink
  fs.unlink(`${lib.baseDirectory + dir}/${file}.json`, err => {
    if (!err) {
      callback(false);
    } else {
      callback('error while deleting file');
    }
  });
};

// list all the items in a directory 
lib.list = (dir, callback) => {
  fs.readdir(`${lib.baseDirectory + dir}/`, (err, filesName) => {
    if (!err && filesName && filesName.length > 0) {
      let trimedFilesName = []
      filesName.forEach(filesName => {
        trimedFilesName.push(filesName.replace('.json',''))
      })
      callback(false , trimedFilesName)
      
    } else {
      callback('Error Reading Directory ')
    }
  });
  
}

// module exports

module.exports = lib;
