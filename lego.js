'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

let priority = ['and', 'or', 'filterIn', 'sortBy', 'select', 'format', 'limit'];

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    let copiedCollection = JSON.parse(JSON.stringify(collection));
    let attrsFromSelect = functions
        .filter(function (item) {
            return typeof item === 'object';
        })
        .reduce(function (acc, cur) {
            return acc.concat(cur.args || []);
        }, []);

    for (let funcName of functions) {
        if (typeof funcName === 'function') {
            continue;
        }
        if (funcName.func.name === 'select') {
            functions
                .push(
                    exports
                        .select(...attrsFromSelect)
                        .func
                );
            break;
        }
    }

    let sortedFuncs = functions.filter(function (item) {
        return typeof item === 'function';
    })
        .sort(function (func1, func2) {
            return priority.indexOf(func1.name) > priority.indexOf(func2.name);
        });

    for (let func in sortedFuncs) {
        if (sortedFuncs.hasOwnProperty(func)) {
            copiedCollection = sortedFuncs[func](copiedCollection);
        }
    }

    return copiedCollection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Object}
 */
exports.select = function (...attrs) {
    function select(collection) {
        if (attrs.length === 0) {
            return [];
        }

        return collection.map(function (friend) {
            let newObj = {};
            attrs.forEach(function (attr) {
                if (friend.hasOwnProperty(attr)) {
                    newObj[attr] = friend[attr];
                }
            });

            return newObj;
        });
    }

    return { func: select, args: attrs };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter (function (friend) {
            if (!friend.hasOwnProperty(property)) {
                return collection;
            }

            return values.some(function (value) {
                return value === friend[property];
            });
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        let sorted = collection
            .filter(function (friend) {
                return friend.hasOwnProperty(property);
            })
            .sort(function (a, b) {
                return a[property] > b[property];
            });
        if (sorted.length === 0) {
            return collection;
        }

        return order === 'asc' ? sorted : sorted.reverse();
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (friend) {
            if (friend.hasOwnProperty(property)) {
                friend[property] = formatter(friend[property]);
            }

            return friend;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...funcs) {
        return function or(collection) {
            let initialCollection = JSON.parse(JSON.stringify(collection));
            let col = [];
            funcs.forEach(function (func) {
                col = col.concat(func(initialCollection));
            });

            return col;
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...funcs) {
        return function and(collection) {
            funcs.forEach(function (func) {
                collection = func(collection);
            });

            return collection;
        };
    };
}
