var validators = {};

/**
 * @param {Object} $validators
 */
exports.setValidators = function($validators) {
    validators = $validators;
};

/**
 * @param {String} name
 *
 * @returns {Function}
 */
exports.get = function(name) {
    return validators[name];
};