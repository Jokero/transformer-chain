var utils = require('../../utils');
var _     = require('lodash');

/**
 * @param {Object}   object
 * @param {Object}   config
 * @param {String[]} path
 * @param {Object}   originalObject
 *
 * @returns {Object}
 */
module.exports = function cleanObject(object, config, path, originalObject) {
    var cleanedObject = {};
    var propertyValue, propertyPath;

    _.forOwn(config, function(propertyConfig, propertyName) {
        propertyValue  = object[propertyName];
        propertyPath   = [].concat(path, propertyName);
        propertyConfig = utils.result(propertyConfig, propertyValue, propertyPath, originalObject);

        if (propertyValue === undefined) {
            return;
        }

        if (propertyConfig === true || propertyConfig instanceof Function) {
            cleanedObject[propertyName] = propertyValue;
        } else if (propertyConfig instanceof Object) {
            if (propertyConfig.properties instanceof Object && propertyValue instanceof Object) {
                var properties              = utils.result(propertyConfig.properties, propertyValue, propertyPath, originalObject);
                cleanedObject[propertyName] = cleanObject(propertyValue, properties, propertyPath, originalObject);
            } else if (propertyConfig.items instanceof Object && propertyConfig.items.properties instanceof Object && propertyValue instanceof Array) {
                var arrayConfig = {};
                propertyValue.forEach(function(item, index) {
                    arrayConfig[index] = propertyConfig.items;
                });

                var cleanedObjectLikeArray  = cleanObject(propertyValue, arrayConfig, propertyPath, originalObject);
                var cleanedArray            = _.values(cleanedObjectLikeArray);
                cleanedObject[propertyName] = cleanedArray;
            } else {
                cleanedObject[propertyName] = propertyValue;
            }
        }
    });

    return cleanedObject;
};