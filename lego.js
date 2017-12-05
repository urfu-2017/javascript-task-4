'use strict';

exports.isStar = true;


// Constants
//
const FUNC_PRIORITY = [
    'and',
    'or',
    'filterIn',
    'sortBy',
    'select',
    'limit',
    'format'
];


// Functions-helpers
//
const _functionSorter = (one, another) => {
    let nameOne = one.name.split(' ')[1];
    let nameAnother = another.name.split(' ')[1];

    return FUNC_PRIORITY.indexOf(nameOne) > FUNC_PRIORITY.indexOf(nameAnother);
};

const _functionApplyer = (obj, f) => f(obj);

const _objectBuilder = (obj, [key, value]) => {
    let newObject = Object.assign({}, obj);
    newObject[key] = value;

    return newObject;
};

const _in = (collection, obj) => collection.indexOf(obj) !== -1;

const _objIn = (obj, collection) => _in(collection, obj);

const _takeKeyValuePair = (item, key) => [key, item[key]];


// Query functions
//
const select = (keys, collection) =>
    collection
        .map(
            (item) =>
                Object.keys(item)
                    .filter(_in.bind(null, keys))
                    .map(_takeKeyValuePair.bind(null, item))
                    .reduce(_objectBuilder, {})
        );

const filterIn = (key, values, collection) =>
    collection.filter((item) => _in(values, item[key]));

const sortBy = (key, order, collection) =>
    collection.sort(
        (one, another) =>
            order === 'asc'
                ? one[key] > another[key]
                : one[key] < another[key]
    );

const format = (key, formatter, collection) =>
    collection.map(
        (item) => {
            let itemCopy = Object.assign({}, item);
            itemCopy[key] = formatter(itemCopy[key]);

            return itemCopy;
        }
    );

const limit = (count, collection) =>
    collection.slice(0, count);

const or = (filters, collection) =>
    collection
        .filter(
            (item) =>
                filters
                    .map(_functionApplyer.bind(null, collection))
                    .some(_objIn.bind(null, item))
        );

const and = (filters, collection) =>
    collection
        .filter(
            (item) =>
                filters
                    .map(_functionApplyer.bind(null, collection))
                    .every(_objIn.bind(null, item))
        );


// Export
//
exports.query = (collection, ...other) =>
    other
        .sort(_functionSorter)
        .reduce(_functionApplyer, collection.slice());

exports.select = (...fields) =>
    select.bind(null, fields);

exports.filterIn = (key, values) =>
    filterIn.bind(null, key, values);

exports.sortBy = (key, order) =>
    sortBy.bind(null, key, order);

exports.format = (key, formatter) =>
    format.bind(null, key, formatter);

exports.limit = (count) =>
    limit.bind(null, count);


if (exports.isStar) {
    exports.or = (...funcs) =>
        or.bind(null, funcs);

    exports.and = (...funcs) =>
        and.bind(null, funcs);
}
