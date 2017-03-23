'use strict';

const validy = require('validy');

const validate = function(object, schema, options) {
    options = Object.assign({}, options, { reject: true });
    return validy(object, schema, options)
        .then(() => object);
};

validate.validators = validy.validators;
validate.formatters = validy.formatters;
validate.ValidationError = validy.ValidationError;

module.exports = validate;