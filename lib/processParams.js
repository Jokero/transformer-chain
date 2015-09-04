var prepare                       = require('./prepare');
var setDefaults                   = require('./setDefaults');
var filter                        = require('./filter');
var validate                      = require('./validate');
var dropFirstLevelUndefinedFields = require('./dropFirstLevelUndefinedFields');
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
        var preparedObject = prepare(objectCopy, configCopy);

        setDefaults(preparedObject, configCopy);

        filter(preparedObject, configCopy, { filtersPropertyName: 'filters' });

        return validate(preparedObject, configCopy).then(function(validatedObject) {
            return filter(validatedObject, configCopy, { filtersPropertyName: 'postValidationFilters' });
        });
    });
}

/**
 * @param {Object} $validators
 */
processParams.setValidators = function($validators) {
    validate.setValidators($validators);
};

module.exports = processParams;