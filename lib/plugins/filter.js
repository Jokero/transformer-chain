var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} [options]
 * @param {String}   [options.configPropertyName=filters]
 *
 * @returns {Object}
 */
module.exports = function filter(object, config, options) {
    object  = _.cloneDeep(object);
    options = options || {};

    var configPropertyName = options.configPropertyName || 'filters';
    var filteredObject = {};
    var filters;

    _.forOwn(config, function(propertyConfig, propertyName) {
        if (propertyConfig instanceof Object) {
            filters = propertyConfig instanceof Function ? propertyConfig : propertyConfig[configPropertyName];

            if (filters) {
                [].concat(filters).forEach(function(filter) {
                    filteredObject[propertyName] = filter(object[propertyName], object);
                });
            } else {
                filteredObject[propertyName] = object[propertyName];
            }
            
            if (propertyConfig.properties instanceof Object && filteredObject[propertyName] instanceof Object) {
                filteredObject[propertyName] = filter(filteredObject[propertyName], propertyConfig.properties);
            } else if (propertyConfig.items instanceof Object && filteredObject[propertyName] instanceof Array) {
                var arrayConfig = {};
                object[propertyName].forEach(function(item, index) {
                    arrayConfig[index] = propertyConfig.items;
                });

                filteredObject[propertyName] = _.values(filter(filteredObject[propertyName], arrayConfig));
            }
        }
    });

    return filteredObject;
};