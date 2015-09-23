var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function setDefaults(object, config) {
    object = _.cloneDeep(object);

    _.forOwn(config, function(propertyConfig, propertyName) {
        if (propertyConfig instanceof Object) {
            if (propertyConfig.default !== undefined && object[propertyName] === undefined) {
                object[propertyName] = propertyConfig.default;
            }

            if (propertyConfig.properties instanceof Object) {
                setDefaults(object[propertyName], propertyConfig.properties);
            } else if (propertyConfig.items instanceof Object && propertyConfig.items.properties instanceof Object && object[propertyName] instanceof Array) {
                object[propertyName].forEach(function(item) {
                    setDefaults(item, propertyConfig.items.properties);
                });
            }
        }
    });

    return object;
};