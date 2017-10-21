'use strict';
exports.isStar = true;

let Table = require('./table');

exports.query = (collection, ...functions) => {
    let table = new Table(collection);
    functions.forEach(func => func(table));

    return table.execute();
};

exports.select = (...params) => {
    return table => {
        table.select = params;
    };
};

exports.filterIn = (property, values) => {
    return table => table.filter(property, values);
};

exports.sortBy = (property, order) => {
    return table => table.sort(property, order === 'asc');
};

exports.format = (property, formatter) =>{
    return table => table.formats.push({ field: property, func: formatter });
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
                let newTable = table.copy();
                func(newTable);
                res.push(newTable.execute());
            });
            table.collection = res.reduce((a, b) => a.concat(b));
        };
    };

    exports.and = (...functions) => {
        return table => functions.forEach(func => func(table));
    };
}
