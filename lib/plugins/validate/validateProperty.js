var validateValue = require('./validateValue');
var utils         = require('../../utils');

/**
 * @param {*}        value
 * @param {Object}   config
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   object
 * @param {Object}   options
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function validateProperty(value, config, path, originalObject, object, options) {
    var promise;
    var validators = utils.result(config.validators, value, path, originalObject, object);

    if (config.properties instanceof Object) {
        validators = Object.assign({ type: 'object' }, validators);
    } else if (config.items instanceof Object) {
        validators = Object.assign({ type: 'array' }, validators);
    }

    if (validators instanceof Object) {
        promise = validateValue(value, validators, path, originalObject, object, options);
    } else {
        promise = Promise.resolve();
    }

    return promise.then(function() {
        var validateObject = require('./validateObject');

        if (config.properties instanceof Object && value instanceof Object) {
            var properties = utils.result(config.properties, value, path, originalObject, object);
            return validateObject(value, properties, path, originalObject, options);
        } else if (config.items instanceof Object && value instanceof Array) {
            var arrayConfig = {};
            value.forEach(function(item, index) {
                arrayConfig[index] = config.items;
            });

            return validateObject(value, arrayConfig, path, originalObject, options);
        }
    });
};