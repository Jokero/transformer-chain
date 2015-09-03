var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function filter(object, config) {
    var filters;

    _.forOwn(config, function(fieldConfig, fieldName) {
        if (fieldConfig instanceof Object) {
            filters = fieldConfig.filters;

            if (filters) {
                [].concat(filters).forEach(function(filter) {
                    object[fieldName] = filter(object[fieldName]);
                });
            }

            if (fieldConfig.properties instanceof Object) {
                filter(object[fieldName], fieldConfig.properties);
            } else if (object[fieldName] instanceof Array && fieldConfig.items instanceof Object && fieldConfig.items.properties instanceof Object) {
                object[fieldName].forEach(function(item) {
                    filter(item, fieldConfig.items.properties);
                });
            }
        }
    });

    return object;
};