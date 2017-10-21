'use strict';
exports.isStar = true;

let Table = require('./table');

let execFuncs = (table, functions) => {
    functions.forEach(func => func(table));
};

let merge = (a, b, or) => {
    let copyA = a.map(item => JSON.stringify(item));
    let copyB = b.map(item => JSON.stringify(item));
    let res = [];
    if (or) {
        res = copyA;
    }
    copyB.forEach(item => {
        if (or === !copyA.includes(item)) {
            res.push(item);
        }
    });

    return res.map(item => JSON.parse(item));
};

exports.query = (collection, ...functions) => {

    let table = new Table(collection);
    execFuncs(table, functions);

    return table.execute();
};

exports.select = (...params) => {
    return table => table.setSelect(params);
};

exports.filterIn = (property, values) => {
    return table => {
        table.filter(property, values);
    };
};

exports.sortBy = (property, order) => {
    return table => {
        table.sort(property, order === 'asc');
    };
};

exports.format = (property, formatter) =>{
    return table => {
        table.formats.push({ field: property, func: formatter });
    };
};

exports.limit = (count) => {
    return table => {
        table.limit = count;
    };
};

if (exports.isStar) {
    exports.or = (...functions) => {
        return table => {
            let res = [];
            functions.forEach(func => {
                let newTable = new Table(table.collection);
                func(newTable);
                res.push(newTable.execute());
            });
            table.collection = res.reduce((a, b) => merge(a, b, true));
        };
    };

    exports.and = (...functions) => {
        return table => {
            let res = [];
            functions.forEach(func => {
                let newTable = new Table(table.collection);
                func(newTable);
                res.push(newTable.execute());
            });
            table.collection = res.reduce((a, b) => merge(a, b, false));
        };
    };
}
