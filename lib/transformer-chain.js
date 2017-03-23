'use strict';

var cloneDeep = require('lodash.clonedeep');
var Transformer = require('./transformer');
var plugins = require('./plugins');

/**
 * @param {Object} object
 * @param {Object} schema
 */
function transformer(object, schema) {
  var clonedObject = cloneDeep(object);
  return new Transformer(clonedObject, schema);
}

transformer.plugins = plugins;

module.exports = transformer;