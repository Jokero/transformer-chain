var utils      = require('../../utils');
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
    var validatorName, validator, validatorConfig;
    var validatorResult, validatorResultPromise, validatorsResultsPromises = [], validatorsErrors = [];

    validatorsConfig = utils.result(validatorsConfig, value, path, originalObject);

    for (validatorName in validatorsConfig) {
        validator = validators.get(validatorName);
        if (!validator) {
            return Promise.reject(new Error('Unknown validator ' + validatorName));
        }

        validatorConfig = utils.result(validatorsConfig[validatorName], value, path, originalObject);
        validatorResult = validator.call(validator, value, validatorConfig, originalObject);

        if (validatorResult && validatorResult.then instanceof Function) {
            validatorResultPromise = validatorResult;
        } else if (validatorResult === undefined) {
            validatorResultPromise = Promise.resolve();
        } else {
            validatorResultPromise = Promise.reject(validatorResult);
        }

        validatorResultPromise.catch(function(err) {
            validatorsErrors = validatorsErrors.concat(err);
        });

        validatorsResultsPromises.push(validatorResultPromise);
    }

    return utils.waitForAllPromises(validatorsResultsPromises).catch(function(err) {
        if (err instanceof Error) {
            return Promise.reject(err);
        }

        return Promise.reject(validatorsErrors);
    });
};