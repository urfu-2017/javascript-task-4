/* eslint-env mocha */
'use strict';

const assert = require('assert');
const { select } = require('./lego');


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
