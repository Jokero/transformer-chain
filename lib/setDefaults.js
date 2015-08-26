var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function setDefaults(object, config) {
    _.forOwn(config, function(fieldConfig, field) {
        if (fieldConfig instanceof Object) {
            if (fieldConfig.default !== undefined && object[field] === undefined) {
                object[field] = fieldConfig.default;
            }

            if (fieldConfig.properties instanceof Object) {
                setDefaults(object[field], fieldConfig.properties);
            } else if (object[field] instanceof Array && fieldConfig.items instanceof Object && fieldConfig.items.properties instanceof Object) {
                object[field].forEach(function(item) {
                    setDefaults(item, fieldConfig.items.properties);
                });
            }
        }
    });

    return object;
};