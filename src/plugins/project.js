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

            const itemsSchema = propertySchema.$items || propertySchema[0];
            if (itemsSchema && Object.keys(itemsSchema).some(p => !p.startsWith('$')) && propertyValue instanceof Array) {
                const arraySchema = Array(newPropertyValue.length).fill(itemsSchema);
                const handledArrayLikeObject = handleObject(newPropertyValue, arraySchema, fullObject, propertyPath);
                newPropertyValue = Object.keys(handledArrayLikeObject).map(key => handledArrayLikeObject[key]);
            } else if (Object.keys(propertySchema).some(p => !p.startsWith('$')) && propertyValue instanceof Object) {
                newPropertyValue = handleObject(propertyValue, propertySchema, fullObject, propertyPath);
            }
        }

        if (newPropertyValue !== undefined) {
            resultObject[propertyName] = newPropertyValue;
        }
    });

    return resultObject;
}

/**
 * @param {Object} object
 * @param {Object} schema
 *
 * @returns {Object}
 */
module.exports = function(object, schema) {
    return handleObject(object, schema, object, []);
};