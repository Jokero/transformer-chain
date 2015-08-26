var validators     = require('./validators');
var validateObject = require('./validateObject');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Promise}
 */
function validate(object, config) {
    return validateObject(object, config, [], object);
}

/**
 * @param {Object} $validators
 */
validate.setValidators = function($validators) {
    validators.setValidators($validators);
};

module.exports = validate;