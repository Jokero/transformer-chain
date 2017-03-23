'use strict';

/**
 * @param {Object}   object
 * @param {Object}   schema
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Object}
 */
const handle = function handle(object, schema, fullObject, path) {
    const resultObject = {};

    Object.keys(schema).forEach(propertyName => {
        if (propertyName.startsWith('$')) {
            return;
        }

        const propertyValue = object[propertyName];
        const propertyPath  = path.concat(propertyName);

        let propertySchema = schema[propertyName];
        if (propertySchema instanceof Function) {
            propertySchema = propertySchema(propertyValue, object, fullObject, propertyPath);
        }

        let newPropertyValue = propertyValue;

        if (propertySchema instanceof Object) {
            if (propertySchema.$default !== undefined && newPropertyValue === undefined) {
                newPropertyValue = propertySchema.$default;
            }

            if ((propertySchema.$items || propertySchema[0]) && newPropertyValue instanceof Array) {
                const objectSchema = propertySchema.$items || propertySchema[0];
                newPropertyValue = newPropertyValue.map((object, i) => handle(object, objectSchema, fullObject, propertyPath.concat(i)));
            } else if (Object.keys(propertySchema).some(p => !p.startsWith('$')) && newPropertyValue instanceof Object) {
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
module.exports = function(object, schema) {
    return handle(object, schema, object, []);
};