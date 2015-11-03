var setObjectDefaults = require('./setObjectDefaults');
var _                 = require('lodash');

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} [originalObject]
 *
 * @returns {object}
 */
module.exports = function(object, config, originalObject) {
    originalObject = originalObject || object;

    return setObjectDefaults(object, config, [], originalObject);
};