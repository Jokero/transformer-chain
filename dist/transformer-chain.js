(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.transformer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
    project: require('./plugins/project'),
    filter: require('./plugins/filter'),
    default: require('./plugins/default'),
    validate: require('./plugins/validate')
};
},{"./plugins/default":2,"./plugins/filter":3,"./plugins/project":4,"./plugins/validate":5}],2:[function(require,module,exports){
'use strict';

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
            if (propertySchema.$default !== undefined && newPropertyValue === undefined) {
                newPropertyValue = propertySchema.$default;
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
module.exports = function (object, schema) {
    return handle(object, schema, object, []);
};
},{}],3:[function(require,module,exports){
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
},{"common-filters":8}],4:[function(require,module,exports){
'use strict';

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

        var newPropertyValue = void 0;

        if (propertySchema === true) {
            newPropertyValue = propertyValue;
        } else if (propertySchema instanceof Object) {
            newPropertyValue = propertyValue;

            if ((propertySchema.$items || propertySchema[0]) && propertyValue instanceof Array) {
                var objectSchema = propertySchema.$items || propertySchema[0];
                newPropertyValue = propertyValue.map(function (object, i) {
                    return handle(object, objectSchema, fullObject, propertyPath.concat(i));
                });
            } else if (Object.keys(propertySchema).some(function (p) {
                return !p.startsWith('$');
            }) && propertyValue instanceof Object) {
                newPropertyValue = handle(propertyValue, propertySchema, fullObject, propertyPath);
            }
        }

        if (newPropertyValue !== undefined) {
            resultObject[propertyName] = newPropertyValue;
        }
    });

    return resultObject;
};

/**
 * @param {Object} object
 * @param {Object} schema
 *
 * @returns {Object}
 */
module.exports = function (object, schema) {
    return handle(object, schema, object, []);
};
},{}],5:[function(require,module,exports){
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
},{"validy":23}],6:[function(require,module,exports){
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
},{"./plugins":1,"./transformer":7,"lodash.clonedeep":11}],7:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var plugins = require('./plugins');

/**
 * @param {Object} object
 * @param {Object} schema
 */

var Transformer = function Transformer(object, schema) {
    var _this = this;

    _classCallCheck(this, Transformer);

    this.result = object;

    Object.keys(plugins).forEach(function (pluginName) {
        var plugin = plugins[pluginName];

        _this[pluginName] = function (options) {
            if (_this.result.then instanceof Function) {
                _this.result = _this.result.then(function (result) {
                    return plugin(result, schema, options);
                });
            } else {
                _this.result = plugin(_this.result, schema, options);
            }

            return _this;
        };
    });
};

module.exports = Transformer;
},{"./plugins":1}],8:[function(require,module,exports){
'use strict';

var filters = {
    toObject: function toObject(value) {
        return assign({}, value);
    },

    toArray: function toArray(value) {
        if (!isDefined(value)) {
            return [];
        }

        if (isPlainObject(value)) {
            return Object.keys(value).map(function (key) {
                return value[key];
            });
        }

        return Array.prototype.slice.call(value);
    },

    toNumber: toNumber,

    toFinite: toFinite,

    toInteger: function toInteger(value) {
        value = toFinite(value);
        var remainder = value % 1;

        return remainder ? value - remainder : value;
    },

    toString: function toString(value) {
        if (!isDefined(value)) {
            return '';
        }

        var result = String(value);

        return result == '0' && 1 / value == -1 / 0 ? '-0' : result;
    },

    toDate: function toDate(value, format) {
        var date = new Date(isDateTime(value) ? value : 0);
        // use format
        return date;
    },

    toBoolean: toBoolean,

    toUndefined: function toUndefined(value) {
        if (toBoolean(value)) {
            return value;
        }
    },

    //Number
    round: function round(value, _round) {
        if (isNumber(value) && (isNumber(_round) || isString(_round))) {
            value = Number(Math.round(value + 'e' + -_round) + 'e' + _round);
        }

        return value;
    },

    range: function range(value, options) {
        if (!isNumber(value) || value < options.from || value > options.to) {
            return options.default;
        }

        return value;
    },

    //String
    trim: function trim(value) {
        if (isString(value)) {
            return value.trim();
        }

        return value;
    },

    prefix: function prefix(value, _prefix) {
        if (isString(value)) {
            return _prefix + value;
        }

        return value;
    },

    postfix: function postfix(value, _postfix) {
        if (isString(value)) {
            return value + _postfix;
        }

        return value;
    },

    shorten: function shorten(value, length) {
        if (isString(value) && value.length > length) {
            return value.substring(0, length <= 3 ? length : length - 3) + (length <= 3 ? '' : '...');
        }

        return value;
    },

    toLowerCase: function toLowerCase(value) {
        if (isString(value)) {
            return value.toLowerCase();
        }

        return value;
    },

    toUpperCase: function toUpperCase(value) {
        if (isString(value)) {
            return value.toUpperCase();
        }

        return value;
    },

    toCamelCase: function toCamelCase(value) {
        if (isString(value)) {
            return value.replace(/^([A-Z])|[\s\-_](\w)/g, function (match, p1, p2) {
                if (p2) return p2.toUpperCase();
                return p1.toLowerCase();
            });
        }

        return value;
    },

    toSnakeCase: function toSnakeCase(value) {
        //TODO
        return value;
    },

    replace: function replace(value, options) {
        var replacement = typeof options.replacement === 'function' ? options.replacement : function () {
            return options.replacement;
        };

        if (isString(value)) {
            try {
                return value.replace(new RegExp(options.pattern), replacement);
            } catch (e) {
                console.error("replace error", e);
                return value;
            }
        }

        return value;
    },

    split: function split(value, seperator) {
        if (isString(value)) {
            return value.split(seperator);
        }

        return value;
    },

    indexOf: function indexOf(value) {
        if (isString(value)) {
            //TODO
        }

        return value;
    },

    //Format
    format: function format(value) {
        if (isString(value)) {
            //TODO
        }

        return value;
    },

    //Sanitize
    html2string: function html2string(value) {
        if (isString(value)) {
            //TODO
        }

        return value;
    },

    sanitizeEmail: function sanitizeEmail(value) {
        if (isString(value)) {
            //TODO
        }

        return value;
    },

    sanitizeUrl: function sanitizeUrl(value) {
        if (isString(value)) {
            //TODO
        }

        return value;
    },

    sanitizeString: function sanitizeString(value) {
        if (isString(value)) {
            //TODO
        }

        return value;
    },

    //Math
    hex2bin: function hex2bin(value) {
        if (isString(value)) {
            //TODO
        }

        return value;
    },

    //Array
    join: function join(value, seperator) {
        if (isArray(value)) {
            return value.join(seperator);
        }

        return value;
    },

    reverse: function reverse(value) {
        if (isArray(value) || isString(value)) {
            return value.reverse();
        }

        return value;
    },

    compact: function compact(value) {
        //TODO remove empty values
    }
};

/* Utils */
/**
 * Extend objects
 *
 * @param {Object} first argument
 * @param {Any} other arguments
 *
 * @returns {Object}
 */
function assign() {
    for (var i = 1; i < arguments.length; i++) {
        for (var k in arguments[i]) {
            if (arguments[i].hasOwnProperty(k)) arguments[0][k] = arguments[i][k];
        }
    }return arguments[0];
}

function toBoolean(value) {
    if (value === 'false' || value === 'undefined' || value === 'null' || value === 'off' || value === 'no' || toNumber(value) <= 0) {
        return false;
    }

    return Boolean(value);
}

function toNumber(value) {
    return Number(value);
}

function toFinite(value) {
    value = toNumber(value);

    return isNaN(value) ? 0 : value;
}

// Checks if the value is a number. This function does not consider NaN a
// number like many other `isNumber` functions do.
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

// Returns false if the object is not a function
function isFunction(value) {
    return typeof value === 'function';
}

// A simple check to verify that the value is an integer. Uses `isNumber`
// and a simple modulo check.
function isInteger(value) {
    return isNumber(value) && value % 1 === 0;
}

// Checks if the value is a boolean
function isBoolean(value) {
    return typeof value === 'boolean';
}

// Uses the `Object` function to check if the given argument is an object.
function isObject(obj) {
    return obj === Object(obj);
}

function isPlainObject(value) {
    return {}.toString.call(value) === '[object Object]';
}

function isArray(value) {
    return {}.toString.call(value) === '[object Array]';
}

// Simply checks if the object is an instance of a date
function isDate(obj) {
    return obj instanceof Date;
}

function isDateTime(value) {
    return !isNaN(Date.parse(value));
}

function isString(value) {
    return typeof value === 'string';
}

// Returns false if the object is `null` of `undefined`
function isDefined(obj) {
    return obj !== null && obj !== undefined;
}

function addFilter(name, filter, params) {
    this[name] = function (value, arg, options) {
        var args = Array.prototype.slice.call(arguments, 2);
        var values = [value];

        if (arguments[1] === undefined || {}.toString.call(arguments[1]) === '[object Object]') {
            options = arguments[1] || {};
        } else {
            options = arguments[2] || {};
            options.arg = arguments[1];
            args.shift();
        }

        if (options.hasOwnProperty('arg')) {
            values.push(options.arg);
        }

        values.push(options);

        return filter.apply(this, values.concat(args));
    };
}

/* Class */

function Filters() {}

Filters.prototype.add = function (filterName, filter, params) {
    var _this = this;

    if (typeof filterName === 'string') {
        addFilter.call(this, filterName, filter, params);
    } else {
        Object.keys(filterName).forEach(function (key) {
            return addFilter.call(_this, key, filterName[key], filter);
        });
    }

    return this;
};

module.exports = new Filters().add(filters);
},{}],9:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var toDateTime = require('normalize-date');

/* Validators */
var validators = {
    custom: function custom(value, arg, options) {
        if (typeof arg === 'function') {
            return arg(value, options);
        }
    },

    //Isn't empty
    required: function required(value) {
        if (!exists(value)) {
            return "Is required";
        }
    },
    presence: 'required',

    notEmpty: function notEmpty(value) {
        if (isEmpty(value)) {
            return "Can't be blank";
        }
    },

    //Equality
    equal: function equal(value, arg, options) {
        if (exists(value) && !deepEqual(value, arg, options.strict)) {
            return 'Must be equal %{arg}';
        }
    },

    confirm: function confirm(value, options) {
        if (exists(value) && !deepEqual(toObject(value)[options.key], toObject(value)[options.comparedKey], options.strict)) {
            return '%{key} must be equal %{comparedKey}';
        }
    },

    //Types
    object: function object(value) {
        if (!isPlainObject(value)) {
            return 'Must be an object';
        }
    },

    array: function array(value) {
        if (!isArray(value)) {
            return 'Must be an array';
        }
    },

    string: function string(value) {
        if (!isString(value)) {
            return 'Must be a string';
        }
    },

    number: function number(value) {
        if (!isNumber(value)) {
            return 'Must be a number';
        }
    },

    integer: function integer(value) {
        if (!isInteger(value)) {
            return 'Must be an integer';
        }
    },

    date: function date(value) {
        if (!isDateTime(value)) {
            return 'Must be a valid date';
        }
    },

    boolean: function boolean(value) {
        if (!isBoolean(value)) {
            return 'Must be a boolean';
        }
    },

    function: function _function(value) {
        if (!isFunction(value)) {
            return 'Must be a function';
        }
    },

    null: function _null(value) {
        if (value !== null) {
            return 'Must be a null';
        }
    },

    //Number
    max: function max(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toNumber(value) < arg : toNumber(value) <= arg)) {
            return options.exclusive ? 'Must be less %{arg}' : 'Must be less or equal %{arg}';
        }
    },

    min: function min(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toNumber(value) > arg : toNumber(value) >= arg)) {
            return options.exclusive ? 'Must be more %{arg}' : 'Must be more or equal %{arg}';
        }
    },

    range: function range(value, options) {
        if (exists(value)) {
            if (!(options.exclusiveFrom || options.exclusive ? toNumber(value) > options.from : toNumber(value) >= options.from)) {
                return {
                    error: 'range.less',
                    message: options.lessMessage || 'Must be from %{from} to %{to}'
                };
            } else if (!(options.exclusiveTo || options.exclusive ? toNumber(value) < options.to : toNumber(value) <= options.to)) {
                return {
                    error: 'range.many',
                    message: options.manyMessage || 'Must be from %{from} to %{to}'
                };
            }
        }
    },

    odd: function odd(value) {
        if (exists(value) && toNumber(value) % 2 !== 1) {
            return 'Must be odd';
        }
    },

    even: function even(value) {
        if (exists(value) && toNumber(value) % 2 !== 0) {
            return 'Must be even';
        }
    },

    divisible: function divisible(value, arg) {
        if (exists(value) && toNumber(value) % arg !== 0) {
            return 'Must be divisible by %{arg}';
        }
    },

    maxLength: function maxLength(value, arg) {
        if (exists(value) && toArray(value).length > arg) {
            return 'Length must be less or equal %{arg}';
        }
    },

    minLength: function minLength(value, arg) {
        if (exists(value) && toArray(value).length < arg) {
            return 'Length must be more or equal %{arg}';
        }
    },

    equalLength: function equalLength(value, arg) {
        if (exists(value) && toArray(value).length !== arg) {
            return 'Length must be equal %{arg}';
        }
    },

    rangeLength: function rangeLength(value, options) {
        if (exists(value)) {
            if (toArray(value).length > options.to) {
                return {
                    error: 'rangeLength.many',
                    message: options.manyMessage || 'Length must be from %{from} to %{to}'
                };
            } else if (toArray(value).length < options.from) {
                return {
                    error: 'rangeLength.less',
                    message: options.lessMessage || 'Length must be from %{from} to %{to}'
                };
            }
        }
    },

    //Size
    maxSize: function maxSize(value, arg, options) {
        var valueSize = byteLength(value, options);

        if (exists(value) && valueSize > arg) {
            return {
                message: 'Size must be less %{arg}',
                size: valueSize
            };
        }
    },

    minSize: function minSize(value, arg, options) {
        var valueSize = byteLength(value, options);

        if (exists(value) && valueSize < arg) {
            return {
                message: 'Size must be more %{arg}',
                size: valueSize
            };
        }
    },

    equalSize: function equalSize(value, arg, options) {
        var valueSize = byteLength(value, options);

        if (exists(value) && valueSize !== arg) {
            return {
                message: 'Length must be equal %{arg}',
                size: valueSize
            };
        }
    },

    rangeSize: function rangeSize(value, options) {
        var valueSize = byteLength(value, options);

        if (exists(value)) {
            if (valueSize < options.from) {
                return {
                    error: 'rangeSize.less',
                    message: options.lessMessage || 'Size must be from %{from} to %{to}',
                    size: valueSize
                };
            } else if (valueSize > options.to) {
                return {
                    error: 'rangeSize.many',
                    message: options.manyMessage || 'Size must be from %{from} to %{to}',
                    size: valueSize
                };
            }
        }
    },

    //RegExp
    pattern: function pattern(value, arg) {
        if (exists(value) && !new RegExp(arg).test(toString(value))) {
            return 'Does not match the pattern %{arg}';
        }
    },

    //White and black list
    inclusion: function inclusion(value, arg) {
        if (exists(value) && !contains(arg, value)) {
            return '%{value} is not allowed';
        }
    },

    exclusion: function exclusion(value, arg) {
        if (exists(value) && contains(arg, value, true)) {
            return '%{value} is restricted';
        }
    },

    //Date and time
    maxDateTime: function maxDateTime(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toDateTime(value) < toDateTime(arg) : toDateTime(value) <= toDateTime(arg))) {
            return 'Must be earlier than %{arg}';
        }
    },

    maxDate: function maxDate(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toDate(value) < toDate(arg) : toDate(value) <= toDate(arg))) {
            return 'Must be earlier than %{arg}';
        }
    },

    minDateTime: function minDateTime(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toDateTime(value) > toDateTime(arg) : toDateTime(value) >= toDateTime(arg))) {
            return 'Must be no earlier than %{arg}';
        }
    },

    minDate: function minDate(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toDate(value) > toDate(arg) : toDate(value) >= toDate(arg))) {
            return 'Must be no earlier than %{arg}';
        }
    },

    equalDateTime: function equalDateTime(value, arg) {
        if (exists(value) && toDateTime(value).valueOf() !== toDateTime(arg).valueOf()) {
            return 'Must be equal %{arg}';
        }
    },

    equalDate: function equalDate(value, arg) {
        if (exists(value) && toDate(value).valueOf() !== toDate(arg).valueOf()) {
            return 'Must be equal %{arg}';
        }
    },

    rangeDateTime: function rangeDateTime(value, options) {
        if (exists(value)) {
            if (!(options.exclusiveFrom || options.exclusive ? toDateTime(value) > toDateTime(options.from) : toDateTime(value) >= toDateTime(options.from))) {
                return {
                    error: 'rangeDateTime.many',
                    message: options.manyMessage || 'Must be from %{from} to %{to}'
                };
            } else if (!(options.exclusiveTo || options.exclusive ? toDateTime(value) < toDateTime(options.to) : toDateTime(value) <= toDateTime(options.to))) {
                return {
                    error: 'rangeDateTime.less',
                    message: options.lessMessage || 'Must be from %{from} to %{to}'
                };
            }
        }
    },

    rangeDate: function rangeDate(value, options) {
        if (exists(value)) {
            if (!(options.exclusiveFrom || options.exclusive ? toDate(value) > toDate(options.from) : toDate(value) >= toDate(options.from))) {
                return {
                    error: 'rangeDate.many',
                    message: options.manyMessage || 'Must be from %{from} to %{to}'
                };
            } else if (!(options.exclusiveTo || options.exclusive ? toDate(value) < toDate(options.to) : toDate(value) <= toDate(options.to))) {
                return {
                    error: 'rangeDate.less',
                    message: options.lessMessage || 'Must be from %{from} to %{to}'
                };
            }
        }
    },

    //Web
    email: function email(value) {
        var PATTERN = /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

        if (exists(value) && !PATTERN.exec(toString(value))) {
            return 'Must be a valid email';
        }
    },

    // A URL validator that is used to validate URLs with the ability to
    // restrict schemes and some domains.
    url: function url(value, options) {
        if (exists(value)) {
            var protocols = options.protocols || ['http', 'https'];

            // https://gist.github.com/dperini/729294
            var regex = '^' +
            // schemes
            '(?:(?:' + protocols.join('|') + '):\\/\\/)' +
            // credentials
            '(?:\\S+(?::\\S*)?@)?';

            regex += '(?:';

            var tld = '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))';

            // This ia a special case for the localhost hostname
            if (options.allowLocal) {
                tld += '?';
            } else {
                // private & local addresses
                regex += '(?!10(?:\\.\\d{1,3}){3})' + '(?!127(?:\\.\\d{1,3}){3})' + '(?!169\\.254(?:\\.\\d{1,3}){2})' + '(?!192\\.168(?:\\.\\d{1,3}){2})' + '(?!172' + '\\.(?:1[6-9]|2\\d|3[0-1])' + '(?:\\.\\d{1,3})' + '{2})';
            }

            var hostname = '(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)' + '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*' + tld + ')';

            // reserved addresses
            regex += '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' + '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' + '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' + '|' + hostname +
            // port number
            '(?::\\d{2,5})?' +
            // path
            '(?:\\/[^\\s]*)?' + '$';

            var PATTERN = new RegExp(regex, 'i');

            if (!PATTERN.exec(toString(value))) {
                return 'is not a valid url';
            }
        }
    },

    ipAddress: function ipAddress(value, options) {
        if (exists(value)) {
            var IPV4_REGEXP = /^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$/;
            var IPV6_REGEXP = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
            var HOSTNAME_REGEXP = /^\s*((?=.{1,255}$)(?=.*[A-Za-z].*)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*)\s*$/;

            var regExps = { ipv4: IPV4_REGEXP, ipv6: IPV6_REGEXP, hostname: HOSTNAME_REGEXP };

            var isError = !Object.keys(regExps).some(function (key) {
                if (options[key] || options[key] === undefined) {
                    return regExps[key].test(toString(value));
                }
            });

            var ipv4 = options.ipv4;
            var ipv6 = options.ipv6;
            var hostname = options.hostname;

            if (isError) {
                if (ipv4 && !ipv6 && !hostname) {
                    return {
                        error: 'ip.v4',
                        message: options.ipv4Message || 'Must be a valid IPv4 address'
                    };
                }

                if (ipv6 && !ipv4 && !hostname) {
                    return {
                        error: 'ip.v6',
                        message: options.ipv6Message || 'Must be a valid IPv6 address'
                    };
                }

                if (hostname && !ipv4 && !ipv6) {
                    return {
                        error: 'ip.hostname',
                        message: options.hostnameMessage || 'Must be a valid hostname'
                    };
                }

                if (ipv6 && ipv4 && !hostname) {
                    return {
                        error: 'ip.address',
                        message: options.addressMessage || 'Must be a valid IP address'
                    };
                }

                return 'Must be a valid IP address or hostname';
            }
        }
    },

    //File
    accept: function accept(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files)) {
            var _ret = function () {
                var allowedTypes = (arg || '').split(',').map(function (type) {
                    return type.trim().replace('*', '');
                });

                var isError = files.some(function (file) {
                    return allowedTypes.every(function (type) {
                        if (type[0] === '.') {
                            //extension
                            return '.' + ((file.name || '').split('.').pop() || '').toLowerCase() !== type;
                        } else {
                            //mime type
                            return (file.type || '').indexOf(type) === -1;
                        }
                    });
                });

                if (isError) {
                    return {
                        v: 'File must be a %{arg}'
                    };
                }
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
    },
    minFileSize: function minFileSize(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && !files.every(function (file) {
            return toNumber(file.size) >= arg;
        })) {
            return 'File size must be more or equal %{arg} bytes';
        }
    },
    maxFileSize: function maxFileSize(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && !files.every(function (file) {
            return toNumber(file.size) <= arg;
        })) {
            return 'File size must be less or equal %{arg} bytes';
        }
    },
    equalFileSize: function equalFileSize(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && !files.every(function (file) {
            return toNumber(file.size) === arg;
        })) {
            return 'File size must be equal %{arg} bytes';
        }
    },
    minFileSizeAll: function minFileSizeAll(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && !(files.reduce(function (prev, curr) {
            return toNumber(prev.size || prev) + toNumber(curr.size);
        }) >= arg)) {
            return 'Total files size must be more or equal %{arg} bytes';
        }
    },
    maxFileSizeAll: function maxFileSizeAll(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && !(files.reduce(function (prev, curr) {
            return toNumber(prev.size || prev) + toNumber(curr.size);
        }) <= arg)) {
            return 'Total files size must be less or equal %{arg} bytes';
        }
    },
    equalFileSizeAll: function equalFileSizeAll(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && !(files.reduce(function (prev, curr) {
            return toNumber(prev.size || prev) + toNumber(curr.size);
        }) === arg)) {
            return 'Total files size must be equal %{arg} bytes';
        }
    },
    minFileNameLength: function minFileNameLength(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && files.some(function (file) {
            return toArray(file.name).length < arg;
        })) {
            return 'File name length must be more or equal %{arg}';
        }
    },
    maxFileNameLength: function maxFileNameLength(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && files.some(function (file) {
            return toArray(file.name).length > arg;
        })) {
            return 'File name length must be less or equal %{arg}';
        }
    },


    //Test
    alwaysValid: function alwaysValid() {},
    alwaysInvalid: function alwaysInvalid() {
        return 'Any value is invalid';
    }
};

/* Utils */
var util = {
    toDateTime: toDateTime,
    toDate: toDate,
    isNumber: isNumber,
    isFunction: isFunction,
    isInteger: isInteger,
    isBoolean: isBoolean,
    isArray: isArray,
    isDateTime: isDateTime,
    isString: isString,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isDefined: isDefined,
    isEmpty: isEmpty,
    exists: exists,
    contains: contains,
    toArray: toArray,
    toNumber: toNumber,
    toString: toString,
    toObject: toObject,
    byteLength: byteLength
};

function toDate(date) {
    return toDateTime(date, { noTime: true });
}

function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

function isFunction(value) {
    return typeof value === 'function';
}

function isInteger(value) {
    return isNumber(value) && value % 1 === 0;
}

function isBoolean(value) {
    return typeof value === 'boolean';
}

function isArray(value) {
    return Array.isArray(value);
}

function isDateTime(value) {
    return !isArray(value) && !isNaN(Date.parse(value));
}

function isString(value) {
    return typeof value === 'string';
}

function isObject(obj) {
    return obj === Object(obj);
}

//This is no full plain-object checking, but it is better for validation when you need to know
//that object is no array or hasn't common type. Generally you prefer to consider instance of custom class as object
function isPlainObject(value) {
    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' && value !== null && !isArray(value) && !(value instanceof RegExp) && !(value instanceof Date) && !(value instanceof Error) && !(value instanceof Number) && !(value instanceof String) && !(value instanceof Boolean) && (typeof value.toDateTime !== 'function' || value.propertyIsEnumerable('toDateTime')); //Moment.js date
}

// Returns false if the object is `null` of `undefined`
function isDefined(obj) {
    return obj != null;
}

//Note! undefined is not empty
function isEmpty(value) {
    if (value === null || typeof value === 'number' && isNaN(value)) {
        return true;
    }

    if (isString(value)) {
        return (/^\s*$/.test(value)
        ); //Whitespace only strings are empty
    }

    if (isArray(value)) {
        return value.length === 0;
    }

    if (isPlainObject(value)) {
        //If we find at least one property we consider it non empty
        for (var attr in value) {
            return false;
        }
        return true;
    }

    return value instanceof Date && isNaN(Date.parse(value)); //Invalid date is empty

    //Boolean, Date, RegExp, Error, Number, Function etc. are not empty
}

function exists(value) {
    return value !== undefined && !isEmpty(value);
}

function contains(collection, value, some) {
    some = some ? 'some' : 'every';

    if (!isDefined(collection)) {
        return false;
    }

    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
        return toArray(value)[some](function (val) {
            return contains(collection, val);
        });
    }

    return toArray(collection).indexOf(value) !== -1;
}

function deepEqual(actual, expected, strict) {
    if (strict !== false) {
        strict = true;
    }

    if (actual === expected) {
        return true;
    } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();
    } else if (!actual || !expected || (typeof actual === 'undefined' ? 'undefined' : _typeof(actual)) != 'object' && (typeof expected === 'undefined' ? 'undefined' : _typeof(expected)) != 'object') {
        return strict ? actual === expected : actual == expected;
    } else {
        return objEqual(actual, expected, strict);
    }
}

function objEqual(a, b, strict) {
    var i, key;

    if (!isDefined(a) || !isDefined(b)) {
        return false;
    }

    if (a.prototype !== b.prototype) return false;

    try {
        var ka = Object.keys(a),
            kb = Object.keys(b);
    } catch (e) {
        //happens when one is a string literal and the other isn't
        return false;
    }

    if (ka.length !== kb.length) return false;

    ka.sort();
    kb.sort();

    //cheap key test
    for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i]) return false;
    }

    //possibly expensive deep test
    for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!deepEqual(a[key], b[key], strict)) return false;
    }

    return (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === (typeof b === 'undefined' ? 'undefined' : _typeof(b));
}

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
    rsComboSymbolsRange = '\\u20d0-\\u20f0',
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

function toArray(value) {
    if (!value) {
        return [];
    }

    if (isArray(value)) {
        return value;
    }

    if (isString(value)) {
        return reHasUnicode.test(value) ? string.match(reUnicode) || [] : value.split('');
    }

    if (Array.from && (value.length || value instanceof Map || value instanceof Set || value[Symbol && Symbol.iterator])) {
        return Array.from(value);
    }

    return Object.keys(value);
}

function toNumber(value) {
    return Number(value);
}

function toString(value) {
    return value && !isObject(value) ? String(value) : '';
}

function toObject(value) {
    return isObject(value) ? value : {};
}

function byteLength(str, options) {
    //Note: Node.js has Buffer.byteLength()
    var stringify = options && typeof options.stringify === 'function' ? options.stringify : JSON.stringify;

    str = str != null ? typeof str === 'string' ? str : stringify(str) : '';
    // returns the byte length of an utf8 string
    var s = str.length;
    for (var i = str.length - 1; i >= 0; i--) {
        var code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;else if (code > 0x7ff && code <= 0xffff) s += 2;
    }
    return s;
}

/* Export */
module.exports = {
    validators: validators,
    util: util
};
},{"normalize-date":12}],10:[function(require,module,exports){
'use strict';

var validatorsLibrary = require('./common-validators-library');
var validators = require('validators-constructor')();

validators.util = validatorsLibrary.util;

module.exports = validators.add(validatorsLibrary.validators);
},{"./common-validators-library":9,"validators-constructor":13}],11:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
}

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, true, true);
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = cloneDeep;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
'use strict';

function setTimezoneOffset(date) {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
}

function normalizeDateTime(date) {
    if (!date) {
        return new Date(date);
    }

    if (arguments.length > 1) {
        date = Array.prototype.slice.call(arguments);
    }

    if (Array.isArray(date)) {
        date = new (Function.prototype.bind.apply(Date, [null].concat(date)))();
    }

    var jsDate = new Date(date);

    if (date === Object(date)) {
        //Native or Moment.js date
        var momentBaseDate = date.creationData && date.creationData().input;

        if (!(momentBaseDate && (typeof momentBaseDate === 'number' || typeof momentBaseDate === 'string' && /:.+Z|GMT|[+-]\d\d:\d\d/.test(momentBaseDate)))) {
            setTimezoneOffset(jsDate); //Any data except moment.js date from timestamp or UTC string (UTC ISO format have to contains time)
        }

        return jsDate;
    }

    if (!isNaN(jsDate) && typeof date === 'string') {
        //ISO or RFC
        if (date.match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/) && date.indexOf('GMT') === -1) {
            //RFC without GMT
            setTimezoneOffset(jsDate);
        }
    } else {
        //Timestamp (always in UTC)
        jsDate = new Date(Number(String(date).split('.').join('')));
    }

    return jsDate;
}

function normalizeDate(date, options) {
    date = normalizeDateTime(date);

    return (options || {}).noTime ? new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) : date;
}

module.exports = normalizeDate;
},{}],13:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var FORMAT_REGEXP = /(%?)%\{([^\}]+)\}/g; // Finds %{key} style patterns in the given string
var MESSAGE_REGEXP = /message/i;
var hiddenPropertySettings = {
    enumerable: false,
    configurable: false,
    writable: true
};
var RESULT_HANDLER = 'resultHandler';
var EXCEPTION_HANDLER = 'exceptionHandler';
var ERROR_FORMAT = 'errorFormat';
var MESSAGE = 'message';
var SIMPLE_ARGS_FORMAT = 'simpleArgsFormat';
var ONE_OPTIONS_ARG = 'oneOptionsArg';
var ARG = 'arg';

/**
 * Add extra advantages to validator
 *
 * @param {Object}   validators - validators library
 * @param {String}   name - validator's name
 * @param {Function} validator - user validator
 *
 * @returns {Function} extended validator
 */
function validatorWrapper(validators, name, validator) {
    return function (value, options) {
        var error = void 0,
            args = arguments;
        var alias = this && this.alias;
        var validatorObj = validators[name];
        var validatorAliasObj = alias ? validators[alias] : {};
        var arg = validatorObj[ARG] || validatorAliasObj[ARG] || validators[ARG];
        var isSimpleArgsFormat = validatorObj[SIMPLE_ARGS_FORMAT] || validatorAliasObj[SIMPLE_ARGS_FORMAT] || validators[SIMPLE_ARGS_FORMAT];

        options = assign({}, validatorObj.defaultOptions, validatorAliasObj.defaultOptions, options);

        if (typeof options.parse === 'function') {
            value = options.parse(value);
        }

        if (options.hasOwnProperty(arg) && !isSimpleArgsFormat) {
            args = [value, options[arg]].concat(Array.prototype.slice.call(arguments, 1));
        }

        try {
            var resultHandler = validatorObj[RESULT_HANDLER] || validatorAliasObj[RESULT_HANDLER] || validators[RESULT_HANDLER];

            error = resultHandler(validator.apply(validators, args));
        } catch (err) {
            var exceptionHandler = validatorObj[EXCEPTION_HANDLER] || validatorAliasObj[EXCEPTION_HANDLER] || validators[EXCEPTION_HANDLER];

            if (typeof exceptionHandler === 'function') {
                error = exceptionHandler(err);
            } else {
                throw err;
            }
        }

        function handleError(error) {
            if (error) {
                var _ret = function () {
                    var errorObj = (typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' ? error : null; //in case if we rewrite message in options and want to use fields from error object in the placeholders
                    var message = options[MESSAGE] || validatorObj[MESSAGE] || validatorAliasObj[MESSAGE];

                    if (message) {
                        error = message;
                    }

                    var formattedErrorMessage = validators.formatMessage(error, assign({ validator: alias || name, value: value }, errorObj, options));
                    var format = validatorObj[ERROR_FORMAT] || validatorAliasObj[ERROR_FORMAT] || validators[ERROR_FORMAT];

                    if (format) {
                        if (typeof formattedErrorMessage === 'string') {
                            formattedErrorMessage = { message: formattedErrorMessage };
                        }

                        if (format.$options) {
                            format = assign({}, format);

                            Object.keys(options).forEach(function (key) {
                                if (!MESSAGE_REGEXP.test(key) && typeof options[key] !== 'function') {
                                    format[key] = options[key];
                                }
                            });
                        }
                        delete format.$options;

                        if (format.$origin) {
                            format = assign({}, format, formattedErrorMessage);
                        }
                        delete format.$origin;

                        return {
                            v: validators.formatMessage(format, assign({ validator: alias || name, value: value }, options, formattedErrorMessage))
                        };
                    }

                    return {
                        v: formattedErrorMessage
                    };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }
        }

        return (typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' && typeof error.then === 'function' ? error.then(handleError) : handleError(error);
    };
}

/**
 * Format string with patterns
 *
 * @param {String} str ("I'm %{age} years old")
 * @param {Object} [values] ({age: 21})
 *
 * @returns {String} formatted string ("I'm 21 years old")
 */
function formatStr(str, values) {
    values = values || {};

    if (typeof str !== 'string') {
        return str;
    }

    return str.replace(FORMAT_REGEXP, function (m0, m1, m2) {
        return m1 === '%' ? "%{" + m2 + "}" : values[m2];
    });
}

/**
 * Check that value is plain object
 *
 * @param {Any} value
 *
 * @returns {Boolean}
 */
function isPlainObject(value) {
    return {}.toString.call(value) === '[object Object]' && (typeof value.toDate !== 'function' || value.propertyIsEnumerable('toDate')); //For moment.js dates
}

/**
 * Extend objects
 *
 * @param {Object} first argument
 * @param {Any} other arguments
 *
 * @returns {Object}
 */
function assign() {
    for (var i = 1; i < arguments.length; i++) {
        for (var k in arguments[i]) {
            if (arguments[i].hasOwnProperty(k)) arguments[0][k] = arguments[i][k];
        }
    }return arguments[0];
}

/**
 * Validators constructor
 *
 * @param {Object}          [params]
 * @param {Object}            [errorFormat] - format of validators result
 * @param {Function}          [formatStr] - for format message strings with patterns
 * @param {Function}          [resultHandler] - handle result of validation
 * @param {Function|String}   [exceptionHandler] - handle JS exceptions
 * @param {String}            [simpleArgsFormat] - any non object argument will be transformed to the `{arg: <argument>}`
 * @param {String}            [oneOptionsArg] - ignore second options argument
 * @param {String}            [arg] - name of compared value
 * @param {Object}            [util] - reserved for validator's libraries helpers
 *
 * @constructor
 */
function Validators(params) {
    Object.defineProperties(this, {
        errorFormat: hiddenPropertySettings,
        formatStr: hiddenPropertySettings,
        resultHandler: hiddenPropertySettings,
        exceptionHandler: hiddenPropertySettings,
        arg: hiddenPropertySettings,
        simpleArgsFormat: hiddenPropertySettings,
        oneOptionsArg: hiddenPropertySettings,
        util: hiddenPropertySettings
    });

    this.errorFormat = {
        error: '%{validator}',
        message: '%{message}',
        $options: true,
        $origin: true
    };
    this.formatStr = formatStr;
    this.resultHandler = function (result) {
        return result;
    };
    this.arg = 'arg';
    this.util = {};

    assign(this, params);
}

/**
 * @param {String} name of validator
 * @param {Function|String|Array} validator, alias or validators array
 * @param {Object} params
 *
 * @returns {Validators} Validators instance
 */
function addValidator(name, validator, params) {
    var _this = this;
    var validators = validator instanceof Array ? validator : [validator];
    var validate = void 0;

    if (typeof validator === 'string') {
        validate = function validate() /*value, arg, options*/{
            return _this[validator].apply({ alias: name, _this: _this }, arguments);
        };
    } else {
        validate = function validate(value /*arg, options*/) {
            var args = Array.prototype.slice.call(arguments, 2);
            var arg1 = arguments[1];
            var arg2 = arguments[2];
            var _this2 = this && this._this || _this;
            var isSimpleArgsFormat = _this2[name][SIMPLE_ARGS_FORMAT] || _this2[SIMPLE_ARGS_FORMAT];
            var isOneOptionsArg = _this2[name][ONE_OPTIONS_ARG] || _this2[ONE_OPTIONS_ARG];
            var options = !isOneOptionsArg && isPlainObject(arg2) ? arg2 : {};

            if (arg1 != null && typeof arg1 !== 'boolean') {
                if (isPlainObject(arg1)) {
                    options = arg1;
                } else {
                    options[_this2[name][ARG] || _this2[ARG]] = arg1;

                    if (!isSimpleArgsFormat) {
                        args.shift();
                    }
                }
            }

            for (var i = 0; i < validators.length; i++) {
                var base = validators[i];

                switch (typeof base === 'undefined' ? 'undefined' : _typeof(base)) {
                    case 'function':
                        validator = validatorWrapper(_this2, name, base);break;

                    case 'string':
                        validator = _this2[base];break;

                    case 'object':
                        validator = _this2[base[0]];
                        options = assign({}, options, base[1]);
                }

                var error = validator.apply(this, [value, options].concat(args));

                if (error) {
                    return error;
                }
            }
        };
    }

    assign(validate, params);

    validate.curry = function () /*arg, options*/{
        var _arguments = arguments;
        //Partial application
        return function (value) {
            return validate.apply(_this, [value].concat(Array.prototype.slice.call(_arguments)));
        };
    };

    _this[name] = validate;
}

/**
 * @param {String|Object} validatorName or validators map like {validator1: validator1Fn, validator2: validator2Fn, ...}
 * @param {Object} params for every validator
 *
 * @returns {Validators} Validators instance
 */
Validators.prototype.add = function (validatorName, validators, params) {
    var _this3 = this;

    if (typeof validatorName === 'string') {
        addValidator.call(this, validatorName, validators, params);
    } else {
        Object.keys(validatorName).forEach(function (key) {
            return addValidator.call(_this3, key, validatorName[key], validators);
        });
    }

    return this;
};

/**
 * Format any structure which contains pattern strings
 *
 * @param {String|Object|Function} message. Object will be processed recursively. Function will be executed
 * @param {Object} [values]
 *
 * @returns {String|Object} formatted string or object
 */
Validators.prototype.formatMessage = function (message, values) {
    var _this4 = this;

    if (typeof message === 'function') {
        message = message(values.value, values);
    }

    if ((typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object') {
        var formattedMessage = {};

        Object.keys(message).forEach(function (key) {
            return formattedMessage[_this4.formatStr(key, values)] = _this4.formatStr(message[key], values);
        });

        if (message[MESSAGE]) {
            //Show not enumerable message of JS exception
            formattedMessage[MESSAGE] = this.formatStr(message[MESSAGE], values);
        }

        return formattedMessage;
    }

    return this.formatStr(message, values);
};

module.exports = function (options) {
    return new Validators(options);
};
},{}],14:[function(require,module,exports){
'use strict';

exports.flat = require('./formatters/flat');
exports.nested = require('./formatters/nested');
},{"./formatters/flat":15,"./formatters/nested":16}],15:[function(require,module,exports){
'use strict';

/**
 * @param {Object} object
 * @param {string} [path='']
 * @param {Object} [flatObject={}]
 * 
 * @returns {Object}
 */

function flatten(object) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var flatObject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    Object.keys(object).forEach(function (propertyName) {
        var propertyValue = object[propertyName];

        if (propertyValue instanceof Object && !(propertyValue instanceof Array)) {
            flatten(propertyValue, path + propertyName + '.', flatObject);
        } else {
            flatObject[path + propertyName] = propertyValue;
        }
    });

    return flatObject;
}

/**
 * @param {Object} object
 * 
 * @returns {Object}
 */
module.exports = function (object) {
    return flatten(object);
};
},{}],16:[function(require,module,exports){
'use strict';

/**
 * Errors object has nested structure by default, so we just return object without any changes
 *
 * @param {Object} errors
 *
 * @returns {Object}
 */

module.exports = function (errors) {
  return errors;
};
},{}],17:[function(require,module,exports){
'use strict';

var validateObject = require('./validateObject');
var ValidationError = require('./validationError');
var formatters = require('./formatters');

var DEFAULT_OPTIONS = {
    format: 'flat',
    reject: false
};

/**
 * @param {Object}  object
 * @param {Object}  schema
 * @param {Object}  [options={}]
 * @param {string}    [options.format=flat]
 * @param {boolean}   [options.reject=false]
 *
 * @returns {Promise}
 */
module.exports = function (object, schema) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    options = Object.assign({}, DEFAULT_OPTIONS, options);

    return new Promise(function (resolve, reject) {
        var formatter = formatters[options.format];
        if (!formatter) {
            return reject(new Error('Unknown format ' + options.format));
        }

        validateObject(object, schema, object, []).then(function (validationErrors) {
            if (!validationErrors) {
                return resolve();
            }

            var formattedErrors = formatter(validationErrors);

            if (options.reject) {
                reject(new ValidationError(formattedErrors));
            } else {
                resolve(formattedErrors);
            }
        }).catch(reject);
    });
};
},{"./formatters":14,"./validateObject":18,"./validationError":21}],18:[function(require,module,exports){
'use strict';

var validateProperty = require('./validateProperty');

/**
 * @param {Object}   object
 * @param {Object}   schema
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Promise}
 */
module.exports = function (object, schema, fullObject, path) {
    var validationPromises = [];
    var validationErrors = {};

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

        if (propertySchema instanceof Object) {
            var validationPromise = validateProperty(propertyValue, propertySchema, object, fullObject, propertyPath);

            validationPromise.then(function (validationError) {
                if (validationError) {
                    validationErrors[propertyName] = validationError;
                }
            });

            validationPromises.push(validationPromise);
        }
    });

    return Promise.all(validationPromises).then(function () {
        if (Object.keys(validationErrors).length) {
            return validationErrors;
        }
    });
};
},{"./validateProperty":19}],19:[function(require,module,exports){
'use strict';

var validateValue = require('./validateValue');

/**
 * @param {*}        value
 * @param {Object}   schema
 * @param {Object}   object
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Promise}
 *
 */
module.exports = function (value, schema, object, fullObject, path) {
    var validatorsOptions = schema.$validate;
    if (validatorsOptions instanceof Function) {
        validatorsOptions = validatorsOptions(value, object, fullObject, path);
    }

    var promise = validatorsOptions instanceof Object ? validateValue(value, validatorsOptions, object, fullObject, path) : Promise.resolve();

    return promise.then(function (validationErrors) {
        if (validationErrors) {
            return validationErrors;
        }

        var validateObject = require('./validateObject');

        if (schema.$items || schema[0]) {
            if (!(value instanceof Array)) {
                return Promise.resolve([{
                    error: 'array',
                    message: 'must be an array'
                }]);
            }

            var propertiesSchema = {};
            var itemSchema = schema.$items || schema[0];

            value.forEach(function (item, index) {
                return propertiesSchema[index] = itemSchema;
            });

            return validateObject(value, propertiesSchema, fullObject, path);
        }

        if (Object.keys(schema).some(function (propertyName) {
            return !propertyName.startsWith('$');
        })) {
            if (!(value instanceof Object)) {
                return Promise.resolve([{
                    error: 'object',
                    message: 'must be an object'
                }]);
            }

            return validateObject(value, schema, fullObject, path);
        }
    });
};
},{"./validateObject":18,"./validateValue":20}],20:[function(require,module,exports){
'use strict';

var validators = require('./validators');

/**
 * @param {*}        value
 * @param {Object}   validatorsOptions
 * @param {Object}   object
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Promise}
 */
module.exports = function (value, validatorsOptions, object, fullObject, path) {
    var validatorsResultsPromises = [];
    var validationErrors = [];

    Object.keys(validatorsOptions).forEach(function (validatorName) {
        var validator = validators[validatorName];
        if (!validator) {
            throw new Error('Unknown validator ' + validatorName);
        }

        var validatorOptions = validatorsOptions[validatorName];
        if (validatorOptions instanceof Function) {
            validatorOptions = validatorOptions(value, object, fullObject, path);
        }

        if (validatorOptions === false || validatorOptions === null || validatorOptions === undefined) {
            return;
        }

        var validatorResult = validator(value, validatorOptions, object, fullObject, path);

        var validatorResultPromise = Promise.resolve(validatorResult);
        validatorResultPromise.then(function (validationError) {
            if (validationError) {
                validationErrors.push(validationError);
            }
        });

        validatorsResultsPromises.push(validatorResultPromise);
    });

    return Promise.all(validatorsResultsPromises).then(function () {
        if (validationErrors.length) {
            return validationErrors;
        }
    });
};
},{"./validators":22}],21:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
        var instance = Reflect.construct(cls, Array.from(arguments));
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
        return instance;
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype, {
        constructor: {
            value: cls,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(ExtendableBuiltin, cls);
    } else {
        ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
}

var ValidationError = function (_extendableBuiltin2) {
    _inherits(ValidationError, _extendableBuiltin2);

    function ValidationError(errors) {
        _classCallCheck(this, ValidationError);

        var _this = _possibleConstructorReturn(this, (ValidationError.__proto__ || Object.getPrototypeOf(ValidationError)).call(this));

        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, _this.constructor);
        }

        _this.name = _this.constructor.name;
        _this.errors = errors;
        return _this;
    }

    return ValidationError;
}(_extendableBuiltin(Error));

module.exports = ValidationError;
},{}],22:[function(require,module,exports){
'use strict';

var validators = require('common-validators');

validators.oneOptionsArg = true;

var originalAdd = validators.add;
validators.add = function (validatorName, validator) {
    if (validatorName instanceof Object) {
        return originalAdd.call(validators, validatorName, { simpleArgsFormat: true });
    }

    originalAdd.call(validators, validatorName, validator, { simpleArgsFormat: true });
};

validators.confirmOriginal = validators.confirm;
validators.add({
    confirm: function confirm(value, options, object, fullObject, path) {
        var confirmOptions = {
            key: path[path.length - 1],
            comparedKey: options instanceof Object ? options.key : options
        };

        return this.confirmOriginal(object, confirmOptions);
    }
});

module.exports = validators;
},{"common-validators":10}],23:[function(require,module,exports){
'use strict';

var validate = require('./validate');

validate.validators = require('./validators');
validate.formatters = require('./formatters');
validate.ValidationError = require('./validationError');

module.exports = validate;
},{"./formatters":14,"./validate":17,"./validationError":21,"./validators":22}]},{},[6])(6)
});