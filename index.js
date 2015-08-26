var prepare     = require('./lib/prepare');
var setDefaults = require('./lib/setDefaults');
var filter      = require('./lib/filter');
var validate    = require('./lib/validate');

/**
 * @param {Object}         object
 * @param {Object|Boolean} config
 *
 * @returns {Promise}
 */
function processParams(object, config) {
    if (config === true) {
        return Promise.resolve(object);
    }

    return Promise.resolve().then(function() {
        var preparedObject = prepare(object, config);

        setDefaults(preparedObject, config);

        filter(preparedObject, config);

        return validate(preparedObject, config);
    });
}

/**
 * @param {Object} $validators
 */
processParams.setValidators = function($validators) {
    validate.setValidators($validators);
};

module.exports = processParams;