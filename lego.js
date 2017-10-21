'use strict';
exports.isStar = false;

let Table = require('./table');

const functionsOrder = {
    filter: 0,
    and: 1,
    or: 2,
    sort: 3,
    select: 3,
    limit: 3,
    format: 3
};

let execFuncs = (table, functions) => {
    functions.sort((a, b) => functionsOrder[a.name] > functionsOrder[b.name])
        .forEach(func => func(table));
};

let merge = (a, b) => {
    let c = a.slice();
    b.forEach(item => {
        if (!c.includes(item)) {
            c.push(item);
        }
    });

    return c;
};

exports.query = (collection, ...functions) => {
    let table = new Table(collection);
    execFuncs(table, functions);

    return table.execute();
};

exports.select = (...params) => {
    return function select(table) {
        table.select = params;
    };
};

exports.filterIn = (property, values) => {
    return function filter(table) {
        table.filter(property, values);
    };
};

exports.sortBy = (property, order) => {
    return function sort(table) {
        table.sort(property, order === 'asc');
    };
};

exports.format = (property, formatter) =>{
    return function format(table) {
        table.formats.push({ field: property, func: formatter });
    };
};

exports.limit = (count) => {
    return function limit(table) {
        table.limit = count;
    };
};

if (exports.isStar) {
    exports.or = (...functions) => {
        return function or(table) {
            let res = [];
            functions.forEach(func => {
                let newTable = new Table(table.collection);
                func(newTable);
                res.push(newTable.execute());
            });
            table.collection = res.reduce((a, b) => merge(a, b));
        };
    };

    exports.and = (...functions) => {
        return function and(table) {
            let newTable = new Table(table.collection);
            execFuncs(newTable, functions);
            table.collection = newTable.collection;
        };
    };
}


