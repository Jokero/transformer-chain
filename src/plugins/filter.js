'use strict';

const builtInFilters = Object.assign({}, require('common-filters'));

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
            if (propertySchema.$filter) {
                [].concat(propertySchema.$filter).forEach(item => {
                    let filter;
                    let options = {};

                    if (item instanceof Function) {
                        filter = item;
                    } else if (item instanceof Array) {
                        [filter, options={}] = item;
                        if (typeof filter === 'string') {
                            filter = builtInFilters[filter];
                        }
                    } else {
                        filter = builtInFilters[item];
                    }

                    if (!(filter instanceof Function)) {
                        throw new Error(`Unknown filter ${item}`);
                    }

                    newPropertyValue = filter(newPropertyValue, options, object, fullObject, propertyPath);
                });
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
const plugin = function(object, schema) {
    return handle(object, schema, object, []);
};

plugin.filters = builtInFilters;

module.exports = plugin;