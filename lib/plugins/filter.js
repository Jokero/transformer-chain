var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} [options]
 * @param {Array}    [options.configPropertyName=filters]
 *
 * @returns {Object}
 */
module.exports = function filter(object, config, options) {
    object  = _.cloneDeep(object);
    options = options || {};

    var configPropertyName = options.configPropertyName || 'filters';
    var filters;

    _.forOwn(config, function(propertyConfig, propertyName) {
        if (propertyConfig instanceof Object) {
            filters = propertyConfig instanceof Function ? propertyConfig : propertyConfig[configPropertyName];

            if (filters) {
                [].concat(filters).forEach(function(filter) {
                    object[propertyName] = filter(object[propertyName], object);
                });
            }
            
            if (propertyConfig.properties instanceof Object && object[propertyName] instanceof Object) {
                filter(object[propertyName], propertyConfig.properties);
            } else if (propertyConfig.items instanceof Object && object[propertyName] instanceof Array) {
                var arrayConfig = {};
                object[propertyName].forEach(function(item, index) {
                    arrayConfig[index] = propertyConfig.items;
                });

                filter(object[propertyName], arrayConfig);
            }
        }
    });

    return object;
};