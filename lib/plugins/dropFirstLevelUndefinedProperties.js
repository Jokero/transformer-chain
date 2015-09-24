var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function(object, config) {
    var cleanedObject = {};

    _.forOwn(config, function(propertyConfig, propertyName) {
        if (object[propertyName] !== undefined) {
            cleanedObject[propertyName] = object[propertyName];
        }
    });

    return cleanedObject;
};