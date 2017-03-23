'use strict';

/**
 * @param {Object}   object
 * @param {Object}   schema
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Object}
 */

var handle = function handle(object, schema, fullObject, path) {
    var resultObject = {};

    Object.keys(schema).forEach(function (propertyName) {
        if (propertyName.startsWith('$')) {
            return;
        }

        var propertyValue = object[propertyName];
        var propertyPath = path.concat(propertyName);

        var propertySchema = schema[propertyName];
        if (propertySchema instanceof Function) {
            propertySchema = propertySchema(propertyValue, object, fullObject, propertyPath);
        }

        var newPropertyValue = propertyValue;

        if (propertySchema instanceof Object) {
            if (propertySchema.$default !== undefined && newPropertyValue === undefined) {
                newPropertyValue = propertySchema.$default;
            }

            if ((propertySchema.$items || propertySchema[0]) && newPropertyValue instanceof Array) {
                var objectSchema = propertySchema.$items || propertySchema[0];
                newPropertyValue = newPropertyValue.map(function (object, i) {
                    return handle(object, objectSchema, fullObject, propertyPath.concat(i));
                });
            } else if (Object.keys(propertySchema).some(function (p) {
                return !p.startsWith('$');
            }) && newPropertyValue instanceof Object) {
                newPropertyValue = handle(newPropertyValue, propertySchema, fullObject, propertyPath);
            }
        }

        resultObject[propertyName] = newPropertyValue;
    });

    return resultObject;
};

/**
 * @param {Object} object
 * @param {Object} schema
 *
 * @returns {Object}
 */
module.exports = function (object, schema) {
    return handle(object, schema, object, []);
};