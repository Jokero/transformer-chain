var validateValue = require('./validateValue');
var utils         = require('../../utils');

/**
 * @param {*}        value
 * @param {Object}   config
 * @param {String[]} path
 * @param {Object}   originalObject
 *
 * @returns {Promise}
 */
module.exports = function validateProperty(value, config, path, originalObject) {
    var promise;
    var validators = utils.result(config.validators, value, path, originalObject);

    if (config.properties instanceof Object) {
        validators = Object.assign({ type: 'object' }, validators);
    } else if (config.items instanceof Object) {
        validators = Object.assign({ type: 'array' }, validators);
    }

    if (validators instanceof Object) {
        promise = validateValue(value, validators, path, originalObject);
    } else {
        promise = Promise.resolve();
    }

    return promise.then(function() {
        var validateObject = require('./validateObject');

        if (config.properties instanceof Object && value instanceof Object) {
            var properties = utils.result(config.properties, value, path, originalObject);
            return validateObject(value, properties, path, originalObject);
        } else if (config.items instanceof Object && value instanceof Array) {
            var arrayConfig = {};
            value.forEach(function(item, index) {
                arrayConfig[index] = config.items;
            });

            return validateObject(value, arrayConfig, path, originalObject);
        }
    });
};