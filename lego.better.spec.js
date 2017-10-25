/* eslint-env mocha */
'use strict';

const assert = require('assert');
const { select, filterIn, format, limit } = require('./lego');


describe('lego.select', function () {
    it('должен вернуть только указанные поля', function () {
        let collection = [
            { a: 1, b: 2, c: 3 },
            { b: 12, c: 13 },
            { b: 34, d: 12 }];

        let actual = select('c', 'b')(collection);
        assert.deepStrictEqual(actual, [
            { b: 2, c: 3 },
            { b: 12, c: 13 },
            { b: 34 }
        ]);
    });
});

describe('lego.filterIn', function () {
    it('должен вернуть только указанные записи', function () {
        let collection = [
            { a: 'YES', c: 1 },
            { a: 'YEP', b: 2 },
            { a: 'NO' }];

        let actual = filterIn('a', ['YES', 'YEP'])(collection);
        assert.deepStrictEqual(actual, [
            { a: 'YES', c: 1 },
            { a: 'YEP', b: 2 }
        ]);
    });
});


describe('lego.format', function () {
    it('должен вернуть только указанные записи', function () {
        let collection = [
            { a: 'NON-FORMATTED', c: 1 },
            { a: 'NON-FORMATTED', b: 2 },
            { a: 'NON-FORMATTED' }];

        let actual = format('a', () => 'FORMATTED')(collection);
        assert.deepStrictEqual(actual, [
            { a: 'FORMATTED', c: 1 },
            { a: 'FORMATTED', b: 2 },
            { a: 'FORMATTED' }
        ]);
    });
});


describe('lego.limit', function () {
    it('должен вернуть только указанное число', function () {
        let collection = Array(100).fill({});

        let actual = limit(3)(collection);
        assert.equal(actual.length, 3);
    });
});
