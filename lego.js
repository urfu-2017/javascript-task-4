'use strict';

exports.isStar = true;

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

const operatorOrder = ['undefined', 'limit', 'format', 'select'];

exports.query = function (collection, ...queries) {
    return queries
        .sort((x, y) => operatorOrder.indexOf(x.type) - operatorOrder.indexOf(y.type))
        .reduce((acc, x) => x(acc), deepCopy(collection));
};

exports.select = function (...fields) {
    var result = list => deepCopy(list).map(x => {
        var existing = fields.filter(f => f in x);

        return Object.assign({}, ...existing.map(e => ({ [e]: x[e] })));
    });

    return Object.assign(result, { type: 'select' });
};

exports.filterIn = function (property, values) {
    return list => deepCopy(list).filter(x => values.includes(x[property]));
};


exports.sortBy = function (property, order) {
    return list => deepCopy(list).sort(({ [property]: x }, { [property]: y }) => {
        if (x === y) {
            return 0;
        }

        return (order === 'asc' ? 1 : -1) * (x > y ? 1 : -1);
    });
};

exports.format = function (property, formatter) {
    var result = list => deepCopy(list).map(
        x => Object.assign(x, { [property]: formatter(x[property]) })
    );

    return Object.assign(result, { type: 'format' });
};

exports.limit = function (count) {
    var result = list => deepCopy(list).filter((x, i) => i < count);

    return Object.assign(result, { type: 'limit' });
};

if (exports.isStar) {

    exports.or = function (...filters) {
        return list => deepCopy(list).filter(x => filters.some(f => f([x]).length));
    };

    exports.and = function (...filters) {
        return list => deepCopy(list).filter(x => filters.every(f => f([x]).length));
    };
}
