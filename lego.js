'use strict';

exports.isStar = true;

const OPERATION_PRIORITY = ['filterIn', 'and', 'or', 'sortBy', 'select', 'limit', 'format'];
const priority = name => OPERATION_PRIORITY.indexOf(name);

const copyCollection = collection => JSON.parse(JSON.stringify(collection));
const getFuncName = func => func.toString().split(/[^A-Za-z]/)[4];

exports.query = (collection, ...params) =>
    params
        .sort((a, b) => priority(getFuncName(a)) - priority(getFuncName(b)))
        .reduce((collectionCopy, param) => param(collectionCopy), copyCollection(collection));

function select(collection, params) {
    return collection.reduce((result, entry) => {
        let newEntry = params.reduce((element, param) => {
            if (entry[param] !== undefined) {
                element[param] = entry[param];
            }

            return element;
        }, {});
        result.push(newEntry);

        return result;
    }, []);
}

exports.select = (...params) => collection => select(collection, params);

const filterIn = (collection, property, values) => collection
    .filter(entry => values.includes(entry[property]));

exports.filterIn = (property, values) => collection => filterIn(collection, property, values);

const sortBy = (collection, property, order) => {
    let copy = copyCollection(collection);
    if (order === 'asc') {
        return copy.sort((a, b) => a[property] > b[property]);
    }

    return copy.sort((a, b) => a[property] < b[property]);
};

exports.sortBy = (property, order) => collection => sortBy(collection, property, order);

const format = (collection, property, formatter) =>
    collection.map(entry => {
        if (entry[property] !== undefined) {
            entry[property] = formatter(entry[property]);
        }

        return entry;
    });


exports.format = (property, formatter) => collection => format(collection, property, formatter);

const limit = (collection, count) => collection.slice(0, count);

exports.limit = count => collection => limit(collection, count);

if (exports.isStar) {
    const or = (collection, params) =>
        collection.filter(entry =>
            params.some(param => param([entry]).length)
        );

    exports.or = (...params) => collection => or(collection, params);

    const and = (collection, params) =>
        collection.filter(entry =>
            params.every(param => param([entry]).length)
        );

    exports.and = (...params) => collection => and(collection, params);
}
