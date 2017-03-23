'use strict';

const cloneDeep   = require('lodash.clonedeep');
const Transformer = require('./transformer');
const plugins     = require('./plugins');

/**
 * @param {Object} object
 * @param {Object} schema
 */
function transformer(object, schema) {
    const clonedObject = cloneDeep(object);
    return new Transformer(clonedObject, schema);
}

transformer.plugins = plugins;

module.exports = transformer;