var utils      = require('../utils');
var validators = require('./validators');

/**
 * @param {*}        value
 * @param {Object}   validatorsConfig
 * @param {String[]} path
 * @param {Object}   originalObject
 *
 * @returns {Promise}
 */
module.exports = function validateValue(value, validatorsConfig, path, originalObject) {
    var validatorName, validator, validatorOptions;
    var validationResult, validationPromise, validationPromises = [];

    validatorsConfig = utils.result(validatorsConfig, value, path, originalObject);

    for (validatorName in validatorsConfig) {
        validator = validators.get(validatorName);

        if (!validator) {
            return Promise.reject(new Error('Unknown validator ' + validatorName));
        }

        validatorOptions = utils.result(validatorsConfig[validatorName], value, path, originalObject);
        validationResult = validator.call(validator, value, validatorOptions, originalObject);

        if (validationResult instanceof Promise) {
            validationPromise = validationResult;
        } else if (validationResult === null || validationResult === undefined) {
            validationPromise = Promise.resolve();
        } else {
            validationPromise = Promise.reject(validationResult);
        }

        validationPromises.push(validationPromise);
    }

    return utils.waitForAllPromises(validationPromises);
};