'use strict';

exports.isStar = true;

exports.query = function (collection, ...queries) {
    return queries
        .sort((x, y) => (x.priority || 0) - (y.priority || 0))
        .reduce((acc, x) => x(acc), collection.map(x => x));
};

exports.select = function (...fields) {
    var result = list => list.map(x => {
        var elem = {};
        for (var field of fields.filter(f => f in x)) {
            elem[field] = x[field];
        }

        return elem;
    });

    return Object.assign(result, { priority: 3 });
};

exports.filterIn = function (property, values) {
    return list => list.filter(x => values.includes(x[property]));
};


exports.sortBy = function (property, order) {
    return list => list.map(x => x).sort(({ [property]: x }, { [property]: y }) => {
        if (x === y) {
            return 0;
        }

        return (order === 'asc' ? 1 : -1) * (x > y ? 1 : -1);
    });
};

exports.format = function (property, formatter) {
    var result = list => list.map(
        x => Object.assign({}, x, { [property]: formatter(x[property]) })
    );

    return Object.assign(result, { priority: 2 });
};

exports.limit = function (count) {
    var result = list => list.filter((x, i) => i < count);

    return Object.assign(result, { priority: 1 });
};

if (exports.isStar) {

    exports.or = function (...filters) {
        return list => list.filter(x => filters.some(f => f([x]).length));
    };

    exports.and = function (...filters) {
        return list => list.filter(x => filters.every(f => f([x]).length));
    };
}
