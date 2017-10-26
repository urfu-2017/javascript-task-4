'use strict';

exports.isStar = true;

let result = [];
exports.query = function (collection, ...methods) {
    result = copyArr(collection);
    if (methods.length === 0) {
        return result;
    }

    let selects = [];
    [...methods].forEach(method => {
        if (method.name === 'select') {
            selects.push(method);
        } else {
            method();
        }
    });

    selects.forEach(select => {
        select();
    });

    return result;
};

exports.select = function (...rest) {
    function select() {
        result.forEach(friend => {
            for (let key in friend) {
                if ([...rest].indexOf(key) === -1) {
                    delete friend[key];
                }
            }
        });

    }

    return select;
};

exports.filterIn = function (property, values) {
    return () => {
        result = result.filter(friend => {
            return values.toString().indexOf(friend[property]) !== -1;
        });
    };
};

exports.sortBy = function (property, order) {
    return () => {
        result = result.sort((a, b) => {
            return order === 'asc' ? a[property] > b[property] : a[property] < b[property];
        });
    };
};

exports.format = function (property, formatter) {
    return () => {
        for (let i = 0; i < result.length; i++) {
            result[i][property] = formatter(result[i][property]);

        }
    };
};

exports.limit = function (count) {
    return () => {
        result.length = count;

        return result;
    };
};

if (exports.isStar) {

    exports.or = function (...friends) {
        return () => {
            let resultOR = [];
            let backUpResult = copyArr(result);
            [...friends].forEach(friend => {
                result = copyArr(backUpResult);
                friend();
                resultOR = resultOR.concat(result);
            });

            result = resultOR;
        };

    };

    exports.and = function (...filtres) {
        return () => {
            [...filtres].forEach(filter => {
                filter();
            });

        };
    };
}

function copyArr(arr) {
    return JSON.parse(JSON.stringify(arr));
}
