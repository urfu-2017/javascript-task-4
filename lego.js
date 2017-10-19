'use strict';

exports.isStar = true;

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

exports.query = function (collection, ...queries) {
    var qs = { select: [], limit: [], format: [], undefined: [] };
    queries.forEach(x => qs[String(x.type)].push(x));
    var selects = qs.select.map(x => x.fields).reduce((acc, x) => x.filter(y => acc.includes(y)));
    var result = qs.undefined.reduce((acc, x) => x(acc), deepCopy(collection));
    result = qs.limit.concat(qs.format).reduce((acc, x) => x(acc), result);

    return result.map(x => {
        var keys = Object.keys(x).filter(k => selects.includes(k));

        return Object.assign({}, ...keys.map(k => ({ [k]: x[k] })));
    });
};

exports.select = function (...fields) {
    var result = list => list;

    return Object.assign(result, { type: 'select', fields });
};

exports.filterIn = function (property, values) {
    return list => list.filter(x => values.includes(x[property]));
};


exports.sortBy = function (property, order) {
    return list => list.sort(({ [property]: x }, { [property]: y }) => {
        if (x === y) {
            return 0;
        }

        return (order === 'asc' ? 1 : -1) * (x > y ? 1 : -1);
    });
};

exports.format = function (property, formatter) {
    var result = list => list.map(x => Object.assign(x, {
        [property]: formatter(x[property])
    }));

    return Object.assign(result, { type: 'format' });
};

exports.limit = function (count) {
    var result = list => list.filter((x, i) => i < count);

    return Object.assign(result, { type: 'limit' });
};

if (exports.isStar) {

    exports.or = function (...filters) {
        return list => list.filter(x => filters.some(f => f([x]).length));
    };

    exports.and = function (...filters) {
        return list => list.filter(x => filters.every(f => f([x]).length));
    };
}
