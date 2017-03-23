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

        var newPropertyValue = void 0;

        if (propertySchema === true) {
            newPropertyValue = propertyValue;
        } else if (propertySchema instanceof Object) {
            newPropertyValue = propertyValue;

            if ((propertySchema.$items || propertySchema[0]) && propertyValue instanceof Array) {
                var objectSchema = propertySchema.$items || propertySchema[0];
                newPropertyValue = propertyValue.map(function (object, i) {
                    return handle(object, objectSchema, fullObject, propertyPath.concat(i));
                });
            } else if (Object.keys(propertySchema).some(function (p) {
                return !p.startsWith('$');
            }) && propertyValue instanceof Object) {
                newPropertyValue = handle(propertyValue, propertySchema, fullObject, propertyPath);
            }
        }

        if (newPropertyValue !== undefined) {
            resultObject[propertyName] = newPropertyValue;
        }
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