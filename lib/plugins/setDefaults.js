var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function setDefaults(object, config) {
    object = _.cloneDeep(object);

    var objectWithDefaults = {};

    _.forOwn(config, function(propertyConfig, propertyName) {
        if (propertyConfig instanceof Object) {
            if (propertyConfig.default !== undefined && object[propertyName] === undefined) {
                objectWithDefaults[propertyName] = propertyConfig.default;
            } else {
                objectWithDefaults[propertyName] = object[propertyName];
            }

            if (propertyConfig.properties instanceof Object && objectWithDefaults[propertyName] instanceof Object) {
                objectWithDefaults[propertyName] = setDefaults(objectWithDefaults[propertyName], propertyConfig.properties);
            } else if (propertyConfig.items instanceof Object && propertyConfig.items.properties instanceof Object && objectWithDefaults[propertyName] instanceof Array) {
                objectWithDefaults[propertyName] = objectWithDefaults[propertyName].map(function(item) {
                    return setDefaults(item, propertyConfig.items.properties);
                });
            }
        } else {
            objectWithDefaults[propertyName] = object[propertyName];
        }
    });

    return objectWithDefaults;
};