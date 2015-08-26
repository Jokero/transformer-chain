var validateField = require('./validateField');
var utils         = require('../utils');
var _             = require('lodash');

/**
 * @param {Object}   object
 * @param {Object}   config
 * @param {String[]} path
 * @param {Object}   originalObject
 *
 * @returns {Promise}
 */
module.exports = function validateObject(object, config, path, originalObject) {
    var fieldValue, fieldPath;
    var validationPromise, validationPromises = [], validationErrors = {};

    _.forOwn(config, function(fieldConfig, field) {
        fieldValue = object[field];
        fieldPath  = [].concat(path, field);

        if (fieldConfig instanceof Object
            && (fieldConfig.validators instanceof Object
                || fieldConfig.properties instanceof Object
                || fieldConfig.items instanceof Object)) {

            validationPromise = validateField(fieldValue, fieldConfig, fieldPath, originalObject);
            validationPromise.catch(function(err) {
                validationErrors[field] = err;
            });

            validationPromises.push(validationPromise);
        }
    });

    return utils.waitForAllPromises(validationPromises)
        .then(function() {
            return object;
        })
        .catch(function(err) {
            if (err instanceof Error) {
                return Promise.reject(err);
            }

            return Promise.reject(validationErrors);
        });
};