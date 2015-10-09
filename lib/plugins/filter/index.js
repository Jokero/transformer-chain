var filterObject = require('./filterObject');
var _            = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} [options]
 * @param {String}   [options.configPropertyName=filters]
 *
 * @returns {object}
 */
module.exports = function(object, config, options) {
    options                    = _.cloneDeep(options || {});
    options.configPropertyName = options.configPropertyName || 'filters';

    return filterObject(object, config, [], object, options);
};