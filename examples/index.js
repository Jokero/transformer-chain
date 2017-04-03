const transformer = require('transformer');

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
    author: {
        $validate: {
            required: true
        },

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
    return transformer(object, schema) // you can run plugins in the order you want, but this one looks good
        .default()
        .filter()
        .validate()
        .clean()
        .result;
};

transform(book, schema)
    .then(result => {
        // result is transformed object
        console.log('Result', result);
    })
    .catch(err => {
        if (err instanceof transformer.plugins.validate.ValidationError) {
            // you have validation errors
            console.log('Validation errors', err.errors);
        } else {
            // application error (something went wrong)
            console.log('Application error', err);
        }
    });