var validateProperty = require('./validateProperty');
var utils            = require('../../utils');
var _                = require('lodash');

/**
 * @param {Object}   object
 * @param {Object}   config
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   options
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function validateObject(object, config, path, originalObject, options) {
    var validationPromise, validationPromises = [], validationErrors = {};
    var propertyValue, propertyPath;

    _.forOwn(config, function(propertyConfig, propertyName) {
        propertyValue  = object[propertyName];
        propertyPath   = [].concat(path, propertyName);
        propertyConfig = utils.result(propertyConfig, propertyValue, propertyPath, originalObject);

        if (propertyConfig instanceof Object
            && (propertyConfig.validators instanceof Object
                || propertyConfig.properties instanceof Object
                || propertyConfig.items instanceof Object)) {

            validationPromise = validateProperty(propertyValue, propertyConfig, propertyPath, originalObject, options);
            validationPromise.catch(function(err) {
                validationErrors[propertyName] = err;
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