var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} [options]
 * @param {Array}    [options.filtersPropertyName=filters]
 *
 * @returns {Object}
 */
module.exports = function filter(object, config, options) {
    options = options || {};

    var filtersPropertyName = options.filtersPropertyName || 'filters';
    var filters;

    _.forOwn(config, function(propertyConfig, propertyName) {
        if (propertyConfig instanceof Object) {
            filters = propertyConfig[filtersPropertyName];

            if (filters) {
                [].concat(filters).forEach(function(filter) {
                    object[propertyName] = filter(object[propertyName]);
                });
            }

            if (propertyConfig.properties instanceof Object) {
                filter(object[propertyName], propertyConfig.properties);
            } else if (object[propertyName] instanceof Array && propertyConfig.items instanceof Object && propertyConfig.items.properties instanceof Object) {
                object[propertyName].forEach(function(item) {
                    filter(item, propertyConfig.items.properties);
                });
            }
        }
    });

    return object;
};