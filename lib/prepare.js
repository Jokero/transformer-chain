var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function prepare(object, config) {
    var transformedObject = {};
    var propertyValue;

    _.forOwn(config, function(propertyConfig, propertyName) {
        propertyValue = object[propertyName];

        if (propertyConfig === true) {
            transformedObject[propertyName] = propertyValue;
        } else if (propertyConfig instanceof Object) {
            if (propertyConfig.properties instanceof Object) {
                if (!(propertyValue instanceof Object)) {
                    propertyValue = {};
                }
                transformedObject[propertyName] = prepare(propertyValue, propertyConfig.properties);
            } else if (propertyValue instanceof Array && propertyConfig.items instanceof Object && propertyConfig.items.properties instanceof Object) {
                transformedObject[propertyName] = propertyValue.map(function(item) {
                    return prepare(item, propertyConfig.items.properties);
                });
            } else {
                transformedObject[propertyName] = propertyValue;
            }
        }
    });

    return transformedObject;
};