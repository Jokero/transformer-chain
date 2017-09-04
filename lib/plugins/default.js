'use strict';

/**
 * @param {Object}   object
 * @param {Object}   schema
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Object}
 */

function handleObject(object, schema, fullObject, path) {
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

            var itemsSchema = propertySchema.$items || propertySchema[0];
            if (itemsSchema && Object.keys(itemsSchema).some(function (p) {
                return !p.startsWith('$');
            }) && newPropertyValue instanceof Array) {
                var arraySchema = Array(newPropertyValue.length).fill(itemsSchema);
                var handledArrayLikeObject = handleObject(newPropertyValue, arraySchema, fullObject, propertyPath);
                newPropertyValue = Object.keys(handledArrayLikeObject).map(function (key) {
                    return handledArrayLikeObject[key];
                });
            } else if (Object.keys(propertySchema).some(function (p) {
                return !p.startsWith('$');
            }) && newPropertyValue instanceof Object) {
                newPropertyValue = handleObject(newPropertyValue, propertySchema, fullObject, propertyPath);
            }
        }

        resultObject[propertyName] = newPropertyValue;
    });

    return resultObject;
}

/**
 * @param {Object} object
 * @param {Object} schema
 *
 * @returns {Object}
 */
module.exports = function (object, schema) {
    return handleObject(object, schema, object, []);
};