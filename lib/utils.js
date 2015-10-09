var _ = require('lodash');

/**
 * @param {*} value
 *
 * @returns {*}
 */
exports.result = function(value) {
    if (value instanceof Function) {
        var args = Array.prototype.slice.call(arguments, 1);
        value    = value.apply(null, args);
    }

    return value;
};

/**
 * @param {Promise[]} promises
 *
 * @returns {Promise}
 */
exports.waitForAllPromises = function(promises) {
    var errors = [];

    var resolvedPromises = promises.map(function(promise) {
        return promise.catch(function(err) {
            if (err instanceof Error) {
                return Promise.reject(err);
            }

            errors = errors.concat(err);
        });
    });

    return Promise.all(resolvedPromises).then(function(result) {
        if (errors.length) {
            return Promise.reject(errors);
        }

        return result;
    });
};

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
exports.dropFirstLevelUndefinedPropertiesConfig = function(object, config) {
    var cleanedConfig = {};

    _.forOwn(config, function(propertyConfig, propertyName) {
        if (object[propertyName] !== undefined) {
            cleanedConfig[propertyName] = propertyConfig;
        }
    });

    return cleanedConfig;
};