var _ = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 *
 * @returns {Object}
 */
module.exports = function prepare(object, config) {
    var transformedObject = {};
    var fieldValue;

    _.forOwn(config, function(fieldConfig, field) {
        fieldValue = object[field];

        if (fieldConfig === true) {
            transformedObject[field] = fieldValue;
        } else if (fieldConfig instanceof Object) {
            if (fieldConfig.properties instanceof Object) {
                if (!(fieldValue instanceof Object)) {
                    fieldValue = {};
                }
                transformedObject[field] = prepare(fieldValue, fieldConfig.properties);
            } else if (fieldValue instanceof Array && fieldConfig.items instanceof Object && fieldConfig.items.properties instanceof Object) {
                transformedObject[field] = fieldValue.map(function(item) {
                    return prepare(item, fieldConfig.items.properties);
                });
            } else {
                transformedObject[field] = fieldValue;
            }
        }
    });

    return transformedObject;
};