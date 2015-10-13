var filterObject = require('./filterObject');
var _            = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} [originalObject]
 * @param {Object} [options]
 * @param {String}   [options.configPropertyName=filters]
 *
 * @returns {object}
 */
module.exports = function(object, config, originalObject, options) {
    originalObject = originalObject || object;

    options                    = _.cloneDeep(options || {});
    options.configPropertyName = options.configPropertyName || 'filters';

    return filterObject(object, config, [], originalObject, options);
};