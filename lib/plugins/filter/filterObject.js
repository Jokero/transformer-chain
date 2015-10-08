var _ = require('lodash');

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
    var filters;

    _.forOwn(config, function(propertyConfig, propertyName) {
        propertyValue = object[propertyName];
        propertyPath  = [].concat(path, propertyName);

        if (propertyValue === undefined) {
            return;
        }

        filteredObject[propertyName] = propertyValue;

        if (propertyConfig instanceof Object) {
            filters = propertyConfig instanceof Function ? propertyConfig : propertyConfig[options.configPropertyName];

            if (filters) {
                [].concat(filters).forEach(function(filter) {
                    filteredObject[propertyName] = filter(filteredObject[propertyName], propertyPath, originalObject);
                });
            }

            if (propertyConfig.properties instanceof Object && filteredObject[propertyName] instanceof Object) {
                filteredObject[propertyName] = filterObject(filteredObject[propertyName], propertyConfig.properties, propertyPath, originalObject, options);
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