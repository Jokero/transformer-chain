var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function(object, config) {
    _.forOwn(config, function(fieldConfig, fieldName) {
        if (object[fieldName] === undefined) {
            delete config[fieldName];
            delete object[fieldName];
        }
    });
};