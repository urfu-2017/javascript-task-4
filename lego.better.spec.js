/* eslint-env mocha */
'use strict';

const assert = require('assert');
const { select, filterIn, format, limit, sortBy } = require('./lego');


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
    it('должен вернуть отформатированные записи', function () {
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
    it('должен вернуть только указанное число элементов', function () {
        let collection = Array(100).fill({});

        let actual = limit(3)(collection);
        assert.equal(actual.length, 3);
    });

    it('должен вернуть всю коллекцию, если указано число большее длины коллекции', function () {
        let collection = Array(3).fill({});

        let actual = limit(100)(collection);
        assert.equal(actual.length, 3);
    });
});


describe('lego.sortBy', function () {
    let collection = [
        { a: 5 },
        { a: 1 },
        { a: 4 },
        { a: 3 },
        { a: 2 }
    ];

    it('должен вернуть отсортированный по возрастанию список', function () {
        let actual = sortBy('a', 'asc')(collection);
        assert.deepStrictEqual(actual, [
            { a: 1 },
            { a: 2 },
            { a: 3 },
            { a: 4 },
            { a: 5 }
        ]);
    });

    it('должен вернуть отсортированный по убыванию список', function () {
        let actual = sortBy('a', 'desc')(collection);
        assert.deepStrictEqual(actual, [
            { a: 5 },
            { a: 4 },
            { a: 3 },
            { a: 2 },
            { a: 1 }
        ]);
    });


    it('должен вернуть отсортированный по возрастанию список строк', function () {
        let stringsCollection = [
            { a: 'abc' },
            { a: 'xyz' },
            { a: 'def' }
        ];

        let actual = sortBy('a', 'asc')(stringsCollection);
        assert.deepStrictEqual(actual, [
            { a: 'abc' },
            { a: 'def' },
            { a: 'xyz' }
        ]);
    });
});

