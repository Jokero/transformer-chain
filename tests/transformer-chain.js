'use strict';

const transformer     = require('../lib/transformer-chain');
const ValidationError = transformer.plugins.validate.ValidationError;
const chai            = require('chai');
const expect          = chai.expect;
const chaiAsPromised  = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('transformer-chain', function() {
    it('returns rejected with ValidationError promise on validation error', function() {
        const object = {};
        const schema = {
            a: {
                $validate: {
                    required: true
                }
            }
        };

        const promise = transformer(object, schema).validate().result;

        return expect(promise).to.be.rejectedWith(ValidationError)
            .then(validationError => {
                expect(validationError).to.have.property('errors');
                expect(validationError.errors.a).to.be.an.instanceof(Array);
                expect(validationError.errors.a[0].error).to.equal('required');
            });
    });

    it('works with example from readme', function() {
        const book = {
            name: ' The Adventures of Tom Sawyer ',
            author: {
                name: ' Mark Twain '
            },
            reviews: [
                {
                    author: 'Leo Tolstoy ',
                    text: 'Great novel ',
                    visible: true
                },
                {
                    author: ' Fyodor Dostoyevsky',
                    text: ' Very interesting'
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
                name: {
                    $filter: function(value) {
                        return typeof value === 'string' ? value.trim() : value;
                    },
                    $validate: {
                        required: true,
                        string: true
                    }
                }
            },
            reviews: [{
                author: {
                    $filter: ['trim'],
                    $validate: {
                        required: true,
                        string: true
                    }
                },
                text: {
                    $filter: [['trim', { /* some options */ }]],
                    $validate: {
                        required: true,
                        string: true
                    }
                },
                visible: {
                    $default: true,
                    $filter: 'toBoolean'
                }
            }]
        };

        const expectedResult = {
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
                    text: 'Very interesting',
                    visible: true
                }
            ]
        };

        const promise = transformer(book, schema)
                            .default()
                            .filter()
                            .validate()
                            .project()
                            .result;

        return expect(promise).to.be.fulfilled.then(result => {
            expect(result).to.deep.equal(expectedResult);
        });
    });
});