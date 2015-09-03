var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function setDefaults(object, config) {
    _.forOwn(config, function(fieldConfig, fieldName) {
        if (fieldConfig instanceof Object) {
            if (fieldConfig.default !== undefined && object[fieldName] === undefined) {
                object[fieldName] = fieldConfig.default;
            }

            if (fieldConfig.properties instanceof Object) {
                setDefaults(object[fieldName], fieldConfig.properties);
            } else if (object[fieldName] instanceof Array && fieldConfig.items instanceof Object && fieldConfig.items.properties instanceof Object) {
                object[fieldName].forEach(function(item) {
                    setDefaults(item, fieldConfig.items.properties);
                });
            }
        }
    });

    return object;
};