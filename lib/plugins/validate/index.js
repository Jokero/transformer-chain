var validators             = require('./validators');
var validateObject         = require('./validateObject');
var ValidationTimeoutError = require('./errors/timeoutError');

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} [originalObject]
 * @param {Object} [options]
 * @param {Number}   [options.timeout=10000]
 * @param {Number}   [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
function validate(object, config, originalObject, options) {
    originalObject = originalObject || object;
    options        = options || {};

    var timeout = options.timeout || 10000;

    return new Promise(function(resolve, reject) {
        var timeoutObject = setTimeout(function() {
            reject(new ValidationTimeoutError());
        }, timeout);

        validateObject(object, config, [], originalObject, options)
            .then(function(object) {
                clearTimeout(timeoutObject);
                resolve(object);
            })
            .catch(function(err) {
                clearTimeout(timeoutObject);
                reject(err);
            });
    });
}

/**
 * @param {Object} $validators
 */
validate.setValidators = function($validators) {
    validators.setValidators($validators);
};

/**
 * @type {Object}
 */
validate.errors = {
    TimeoutError: ValidationTimeoutError
};

module.exports = validate;