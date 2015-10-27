var utils = require('../../utils');
var _     = require('lodash');

/**
 * @param {Object}   object
 * @param {Object}   config
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   options
 * @param {String}     options.configPropertyName=filters
 *
 * @returns {Object}
 */
module.exports = function filterObject(object, config, path, originalObject, options) {
    var filteredObject = {};
    var propertyValue, propertyPath;

    _.forOwn(config, function(propertyConfig, propertyName) {
        propertyValue  = object[propertyName];
        propertyPath   = [].concat(path, propertyName);
        propertyConfig = utils.result(propertyConfig, propertyValue, propertyPath, originalObject, object);

        filteredObject[propertyName] = propertyValue;

        if (propertyConfig instanceof Object) {
            var filters = propertyConfig instanceof Function ? propertyConfig : propertyConfig[options.configPropertyName];

            if (filters) {
                [].concat(filters).forEach(function(filter) {
                    filteredObject[propertyName] = filter(filteredObject[propertyName], propertyPath, originalObject, object);
                });
            }

            if (propertyConfig.properties instanceof Object && filteredObject[propertyName] instanceof Object) {
                var properties               = utils.result(propertyConfig.properties, filteredObject[propertyName], propertyPath, originalObject, object);
                filteredObject[propertyName] = filterObject(filteredObject[propertyName], properties, propertyPath, originalObject, options);
            } else if (propertyConfig.items instanceof Object && filteredObject[propertyName] instanceof Array) {
                var arrayConfig = {};
                filteredObject[propertyName].forEach(function(item, index) {
                    arrayConfig[index] = propertyConfig.items;
                });

                var filteredObjectLikeArray  = filterObject(filteredObject[propertyName], arrayConfig, propertyPath, originalObject, options);
                var filteredArray            = _.values(filteredObjectLikeArray);
                filteredObject[propertyName] = filteredArray;
            }
        }
    });

    return filteredObject;
};