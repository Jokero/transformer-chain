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

        let newPropertyValue;

        if (propertySchema === true) {
            newPropertyValue = propertyValue;
        } else if (propertySchema instanceof Object) {
            newPropertyValue = propertyValue;

            if ((propertySchema.$items || propertySchema[0]) && propertyValue instanceof Array) {
                const objectSchema = propertySchema.$items || propertySchema[0];
                newPropertyValue = propertyValue.map((object, i) => handle(object, objectSchema, fullObject, propertyPath.concat(i)));
            } else if (Object.keys(propertySchema).some(p => !p.startsWith('$')) && propertyValue instanceof Object) {
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
module.exports = function(object, schema) {
    return handle(object, schema, object, []);
};