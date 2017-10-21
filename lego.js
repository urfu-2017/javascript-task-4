'use strict';
exports.isStar = true;

let Table = require('./table');

let execFuncs = (table, functions) => {
    functions.forEach(func => func(table));
};

let merge = (a, b, or) => {
    let c = a.slice();
    b.forEach(item => {
        if ((or && !c.includes(item)) || (!or && c.includes(item))) {
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
    return table => {
        table.select = params;
    };
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
    let executeFuncs = (table, funcs, or) => {
        let res = [];
        funcs.forEach(func => {
            let newTable = new Table(table.collection);
            func(newTable);
            res.push(newTable.execute());
        });

        table.collection = res.reduce((a, b) => merge(a, b, or));
    };

    exports.or = (...functions) => {
        return table => executeFuncs(table, functions, true);
    };

    exports.and = (...functions) => {
        return table => executeFuncs(table, functions, false);
    };
}
