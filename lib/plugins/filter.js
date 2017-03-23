'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var builtInFilters = Object.assign({}, require('common-filters'));

/**
 * @param {Object}   object
 * @param {Object}   schema
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Object}
 */
var handle = function handle(object, schema, fullObject, path) {
    var resultObject = {};

    Object.keys(schema).forEach(function (propertyName) {
        if (propertyName.startsWith('$')) {
            return;
        }

        var propertyValue = object[propertyName];
        var propertyPath = path.concat(propertyName);

        var propertySchema = schema[propertyName];
        if (propertySchema instanceof Function) {
            propertySchema = propertySchema(propertyValue, object, fullObject, propertyPath);
        }

        var newPropertyValue = propertyValue;

        if (propertySchema instanceof Object) {
            if (propertySchema.$filter) {
                [].concat(propertySchema.$filter).forEach(function (item) {
                    var filter = void 0;
                    var options = {};

                    if (item instanceof Function) {
                        filter = item;
                    } else if (item instanceof Array) {
                        var _item = _slicedToArray(item, 2);

                        filter = _item[0];
                        var _item$ = _item[1];
                        options = _item$ === undefined ? {} : _item$;

                        if (typeof filter === 'string') {
                            filter = builtInFilters[filter];
                        }
                    } else {
                        filter = builtInFilters[item];
                    }

                    if (!(filter instanceof Function)) {
                        throw new Error('Unknown filter ' + item);
                    }

                    newPropertyValue = filter(newPropertyValue, options, object, fullObject, propertyPath);
                });
            }

            if ((propertySchema.$items || propertySchema[0]) && newPropertyValue instanceof Array) {
                var objectSchema = propertySchema.$items || propertySchema[0];
                newPropertyValue = newPropertyValue.map(function (object, i) {
                    return handle(object, objectSchema, fullObject, propertyPath.concat(i));
                });
            } else if (Object.keys(propertySchema).some(function (p) {
                return !p.startsWith('$');
            }) && newPropertyValue instanceof Object) {
                newPropertyValue = handle(newPropertyValue, propertySchema, fullObject, propertyPath);
            }
        }

        resultObject[propertyName] = newPropertyValue;
    });

    return resultObject;
};

/**
 * @param {Object} object
 * @param {Object} schema
 *
 * @returns {Object}
 */
var plugin = function plugin(object, schema) {
    return handle(object, schema, object, []);
};

plugin.filters = builtInFilters;

module.exports = plugin;