var prepare                       = require('./lib/prepare');
var setDefaults                   = require('./lib/setDefaults');
var filter                        = require('./lib/filter');
var validate                      = require('./lib/validate');
var dropFirstLevelUndefinedFields = require('./lib/dropFirstLevelUndefinedFields');
var _                             = require('lodash');

/**
 * @param {Object}         object
 * @param {Object|Boolean} config
 * @param {Object}         [options={}]
 * @param {Boolean}          [options.dropFirstLevelUndefinedFields=false]
 *
 * @returns {Promise}
 */
function processParams(object, config, options) {
    if (config === true) {
        return Promise.resolve(object);
    }

    var objectCopy  = _.cloneDeep(object);
    var configCopy  = _.cloneDeep(config);
    var optionsCopy = _.cloneDeep(options || {});

    if (!optionsCopy.hasOwnProperty('dropFirstLevelUndefinedFields')) {
        optionsCopy.dropFirstLevelUndefinedFields = false;
    }

    if (optionsCopy.dropFirstLevelUndefinedFields) {
        dropFirstLevelUndefinedFields(objectCopy, configCopy);
    }

    return Promise.resolve().then(function() {
        var preparedObject = prepare(objectCopy, configCopy, options);

        setDefaults(preparedObject, configCopy, options);

        filter(preparedObject, configCopy, options);

        return validate(preparedObject, configCopy, options);
    });
}

/**
 * @param {Object} $validators
 */
processParams.setValidators = function($validators) {
    validate.setValidators($validators);
};

module.exports = processParams;