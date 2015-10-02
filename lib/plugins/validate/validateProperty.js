var validateValue = require('./validateValue');
var _             = require('lodash');

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

    if (config.properties instanceof Object) {
        config.validators      = config.validators || {};
        config.validators.type = 'object';
    } else if (config.items instanceof Object) {
        config.validators      = config.validators || {};
        config.validators.type = 'array';
    }

    if (config.validators instanceof Object) {
        promise = validateValue(value, config.validators, path, originalObject);
    } else {
        promise = Promise.resolve();
    }

    return promise.then(function() {
        var validateObject = require('./validateObject');

        if (config.properties instanceof Object) {
            return validateObject(value, config.properties, path, originalObject);
        } else if (value instanceof Array && config.items instanceof Object) {
            var arrayConfig = {};
            value.forEach(function(item, index) {
                arrayConfig[index] = config.items;
            });

            return validateObject(value, arrayConfig, path, originalObject);
        }
    });
};