var validateValue = require('./validateValue');

/**
 * @param {*}        value
 * @param {Object}   config
 * @param {String[]} path
 * @param {Object}   originalObject
 *
 * @returns {Promise}
 */
module.exports = function validateField(value, config, path, originalObject) {
    var promise;

    if (config.validators instanceof Object) {
        promise = validateValue(value, config.validators, path, originalObject);
    } else {
        promise = Promise.resolve();
    }

    return promise.then(function() {
        // todo: костыль или не костыль?
        var validateObject = require('./validateObject');

        if (config.properties instanceof Object) {
            return validateObject(value, config.properties, path, originalObject);
        } else if (value instanceof Array && config.items instanceof Object && config.items.properties instanceof Object) {
            var arrayConfig = {};
            value.forEach(function(item, index) {
                arrayConfig[index] = config.items;
            });

            return validateObject(value, arrayConfig, path, originalObject);
        }
    });
};