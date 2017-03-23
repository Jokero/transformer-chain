# transformer-chain

Declarative processing of objects with support of filters, default values and validators. It can be used in HTTP API for example.
If you need only validation, take a look at [validy](https://github.com/Jokero/validy)

[![NPM version](https://img.shields.io/npm/v/transformer-chain.svg)](https://npmjs.org/package/transformer-chain)
[![Build status](https://img.shields.io/travis/Jokero/transformer-chain.svg)](https://travis-ci.org/Jokero/transformer-chain)

**Note:** This module works in browsers and Node.js >= 6.0.

## Table of Contents

- [Demo](#demo)
- [Installation](#installation)
  - [Node.js](#nodejs)
  - [Browser](#browser)
- [Overview](#overview)
- [Usage](#usage)
  - [Parameters](#parameters)
  - [Return value](#return-value)
- [Plugins](#plugins)
  - [default](#default)
  - [filter](#filter)
  - [validate](#validate)
  - [project](#project)
- [Dynamic schema](#dynamic-schema)
- [Don’t repeat yourself](#dont-repeat-yourself)
- [Build](#build)
- [Tests](#tests)
- [License](#license)


## Demo

Try [demo](https://runkit.com/npm/transformer-chain) on RunKit.

## Installation

```sh
npm install transformer-chain
```

### Node.js
```js
const transformer = require('transformer-chain');
```

### Browser
```
<script src="node_modules/transformer-chain/dist/transformer-chain.js">
```
or minified version
```
<script src="node_modules/transformer-chain/dist/transformer-chain.min.js">
```

You can use the module with AMD/CommonJS or just use `window.transformer`.

## Overview

`transformer-chain` allows you to process flat and nested objects using filters, default values and validators.
There are collections of built-in filters and validators and you can add you own. 
Validators can be asynchronous, you can do DB calls for example and so on.

To process object you should define schema. It's simple object with your constraints:

```js
const book = { // object to process
    name: 'The Adventures of Tom Sawyer',
    author: {
        name: 'Mark Twain'
    },
    reviews: [
        {
            author: 'Leo Tolstoy',
            text: 'Great novel',
            visible: true
        },
        {
            author: 'Fyodor Dostoyevsky',
            text: 'Very interesting'
        }
    ]
};

const schema = {
    name: {
        $filter: 'trim',
        $validate: {
            required: true,
            string: true
        }
    },
    author: { // you can omit check that "author" value is object, it will be done internally 
        name: {
            $filter: function(value) { // you can use function for filtration
                // this example has the same behaviour as built-in "trim": it trims only strings
                return typeof value === 'string' ? value.trim() : value;
            },
            $validate: {
                required: true,
                string: true
            }
        }
    },
    reviews: [{ // define schema for array items
        author: {
            $filter: ['trim', /* another filter */], // you can use array of filters
            $validate: {
                required: true,
                string: true
            }
        },
        text: {
            $filter: [['trim', { /* some options */ }]], // you can pass additional options to filter if needed
            $validate: {
                required: true,
                string: true
            }
        },
        visible: {
            $default: true, // default value will be set when actual value of property is undefined
            $filter: 'toBoolean' // always returns boolean
        }
    }]
};

const transform = function(object, schema) {
    // you can run plugins in the order you want, but this one looks reasonable
    return transformer(object, schema)
        .default()
        .filter()
        .validate()
        .project()
        .result;
}; 

transform(book, schema)
    .then(result => {
        // result is transformed object
    })
    .catch(err => {
        if (err instanceof transformer.plugins.validate.ValidationError) {
            // you have validation errors
        } else {
            // application error (something went wrong)
        }
    });

// async/await example
async function example() {
    try {
        const result = transform(book, schema);
    } catch(err) {
        if (err instanceof transformer.plugins.validate.ValidationError) {
            // you have validation errors
        } else {
            // application error (something went wrong)
        }
    }
}
```

## Usage

```
transformer(object, schema)
    .<plugin1>([options])
    .<pluginN>([options])
    .result
```

#### Parameters

- `object` (Object) - Object to process
- `schema` (Object) - Schema which defines how to process object
- `options` (Object) - Individual options for plugin

#### Return value

(Object | Promise) - Result of processing. The module returns promise when at least one of the plugins is asynchronous, 
i.e., also returns promise. In all other cases object is returned.

### Plugins

By default `transformer-chain` comes with four plugins, but you can add your own if it's needed:

```js
const transformer = require('transformer-chain');
transformer.plugins.yourCustomPlugin = function(object, schema) { /* plugin implementation */ };
```

Built-in plugins:

- default
- filter
- validate
- project

You define order in which plugins will be executed by chaining them. Plugins are executed sequentially.

#### default

Sets default value specified in `$default` field to property when its value is `undefined`.

#### filter

`$filter` allows you to transform value as you need, format, sanitize, etc.
This plugin comes with collection of filters ([common-validators](https://github.com/tamtakoe/common-validators)).

#### validate

This is asynchronous plugin which validates value using set of validators. 
It's just wrapper around [validy](https://github.com/Jokero/validy) module. 
Under the hood `validy` uses collection of different validators defined in [common-validators](https://github.com/tamtakoe/common-validators) module.

#### project

Unlike other built-in plugins `project` plugin does not have special field prefixed by `$`.
It allows you to project only those fields that you need. All properties whose config is resolved to object or `true` 
will be presented in result object. It's useful when you want to get some property in result object as is, i.e., 
without any manipulation:

```js
const book = {
    name: 'The Adventures of Tom Sawyer',
    author: {
        name: 'Mark Twain'
    }
};

const schema = {
    name: {
        $filter: 'trim',
        $validate: {
            required: true,
            string: true
        }
    },
    author: true // here we say that we need this field in result object without any changes
};
```

### Dynamic schema

Sometimes you may need a way to process some property differently depending on specific conditions.
Example with order of various products:

```js
const order = {
    products: [
        {
            type: 'book',
            name: 'The Adventures of Tom Sawyer',
            count: 1
        },
        {
            type: 'sugar',
            weight: 3000
        }
    ]
};

const productsSchemas = {
    book: {
        name: {
            $validate: {
                required: true,
                string: true
            }
        },
        count: {
            $validate: {
                required: true,
                integer: true,
                min: 1
            }
        }
    },

    sugar: {
        weight: {
            $validate: {
                required: true,
                integer: true,
                min: 1000
            }
        }
    }
};

const schema = {
    products: [(product/*, products, order, pathToItem*/) => {
        const productSchema = productsSchemas[product.type] || {};
        return Object.assign({}, productSchema, {
            type: {
                $validate: {
                    required: true,
                    string: true,
                    inclusion: Object.keys(productsSchemas)
                }
            }
        });
    }]
};

// or you can do like this

const alternativeSchema = {
    products: {
        $validate: { // validate also "products" before items validation
            required: true,
            array: true
        },

        $items: function(product/*, products, order, pathToItem*/) {
            const productSchema = productsSchemas[product.type] || {};
            return Object.assign({}, productSchema, {
                type: {
                    $validate: {
                        required: true,
                        string: true,
                        inclusion: Object.keys(productsSchemas)
                    }
                }
            });
        }
    }
};
```

You can do similar things with `$validate` and specific validator:

```js
const bookSchema = {
    author: {
        name: {
            $validate: function(name, author, book, pathToName) {
                // implement your custom logic
                
                // validation will only run if you return object
                // so you can return null for example to skip validation 
                return {
                    required: function(name, author, book, pathToName) {
                        // implement your custom logic
                        // return undefined, null or false if you want skip validation
                    },
                    string: true
                };
            }
        }
    }
};
```

### Don’t repeat yourself

If you have duplicated schemas for different properties you can create collection of common schemas which can be later
reused in multiple places:

```js
const commonSchemas = {
    string(required = false) {
        return {
            $filter: 'trim',
            validators: {
                required: required,
                string: true
            }
        };
    },
    
    email(required = false) {
        return {
            $filter: ['trim', 'toLowerCase'],
            $validate: {
                required: required,
                type: 'string',
                email: true
            }
        };
    }
};
```

## Build

```sh
npm install
npm run build
```

## Tests

```sh
npm install
npm test
```

## License

[MIT](LICENSE)