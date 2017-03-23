'use strict';

var validy = require('validy');

var validate = function validate(object, schema, options) {
    options = Object.assign({}, options, { reject: true });
    return validy(object, schema, options).then(function () {
        return object;
    });
};

validate.validators = validy.validators;
validate.formatters = validy.formatters;
validate.ValidationError = validy.ValidationError;

module.exports = validate;