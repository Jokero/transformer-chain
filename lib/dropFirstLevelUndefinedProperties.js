var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function(object, config) {
    _.forOwn(config, function(propertyConfig, propertyName) {
        if (object[propertyName] === undefined) {
            delete config[propertyName];
            delete object[propertyName];
        }
    });
};