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
module.exports = function setObjectDefaults(object, config, path, originalObject) {
    var objectWithDefaults = {};
    var propertyValue, propertyPath;

    _.forOwn(config, function(propertyConfig, propertyName) {
        propertyValue = object[propertyName];
        propertyPath  = [].concat(path, propertyName);

        if (propertyConfig instanceof Object) {
            if (propertyConfig.default !== undefined && propertyValue === undefined) {
                objectWithDefaults[propertyName] = propertyConfig.default;
            } else {
                objectWithDefaults[propertyName] = propertyValue;
            }

            if (propertyConfig.properties instanceof Object && objectWithDefaults[propertyName] instanceof Object) {
                var properties = utils.result(propertyConfig.properties, objectWithDefaults[propertyName], propertyPath, originalObject);
                objectWithDefaults[propertyName] = setObjectDefaults(objectWithDefaults[propertyName], properties, propertyPath, originalObject);
            } else if (propertyConfig.items instanceof Object && propertyConfig.items.properties instanceof Object && objectWithDefaults[propertyName] instanceof Array) {
                var arrayConfig = {};
                objectWithDefaults[propertyName].forEach(function(item, index) {
                    arrayConfig[index] = propertyConfig.items;
                });

                var filteredObjectLikeArray      = setObjectDefaults(objectWithDefaults[propertyName], arrayConfig, propertyPath, originalObject);
                var filteredArray                = _.values(filteredObjectLikeArray);
                objectWithDefaults[propertyName] = filteredArray;
            }
        } else {
            objectWithDefaults[propertyName] = propertyValue;
        }
    });

    return objectWithDefaults;
};