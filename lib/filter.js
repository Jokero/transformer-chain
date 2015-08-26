var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function filter(object, config) {
    var filters;

    _.forOwn(config, function(fieldConfig, field) {
        if (fieldConfig instanceof Object) {
            filters = fieldConfig.filters;

            if (filters) {
                [].concat(filters).forEach(function(filter) {
                    object[field] = filter(object[field]);
                });
            }

            if (fieldConfig.properties instanceof Object) {
                filter(object[field], fieldConfig.properties);
            } else if (object[field] instanceof Array && fieldConfig.items instanceof Object && fieldConfig.items.properties instanceof Object) {
                object[field].forEach(function(item) {
                    filter(item, fieldConfig.items.properties);
                });
            }
        }
    });

    return object;
};