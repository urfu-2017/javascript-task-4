'use strict';
exports.isStar = true;

let Table = require('./table');

let execFuncs = (table, functions) => {
    functions.forEach(func => func(table));
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
            table.collection = table.collection.filter(element => {

                return functions.some(method => {
                    let newTable = table.copy();
                    method(newTable);

                    return newTable.collection.includes(element);
                });
            });
        };
    };

    exports.and = (...functions) => {
        return table => {
            table.collection = table.collection.filter(element => {

                return functions.every(method => {
                    let newTable = table.copy();
                    method(newTable);

                    return newTable.collection.includes(element);
                });
            });
        };
    };
}

