var validators             = require('./validators');
var validateObject         = require('./validateObject');
var ValidationTimeoutError = require('./errors/timeoutError');
var _                      = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} [options]
 * @param {Number}   [options.timeout=10000]
 *
 * @returns {Promise}
 */
function validate(object, config, options) {
    object = _.cloneDeep(object);
    config = _.cloneDeep(config);

    options = _.cloneDeep(options || {});
    options.timeout = options.timeout || 10000;

    return new Promise(function(resolve, reject) {
        var timeout = setTimeout(function() {
            reject(new ValidationTimeoutError());
        }, options.timeout);

        validateObject(object, config, [], object)
            .then(function(object) {
                clearTimeout(timeout);
                resolve(object);
            })
            .catch(function(err) {
                clearTimeout(timeout);
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

module.exports = validate;