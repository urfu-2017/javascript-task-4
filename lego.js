'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var PRIORITYS = {
    select: 4.5,
    format: 5,
    limit: 6,
    or: 1,
    and: 1,
    filterIn: 2,
    sortBy: 3 };

function doCopyCollection(collection) {
    return collection.map(function (record) {
        var copyRecord = {};
        Object.keys(record).forEach(function (item) {
            if (record.hasOwnProperty(item)) {
                copyRecord[item] = record[item];
            }

            return copyRecord;
        });

        return copyRecord;
    });
}

function sortFunctions(firstFunc, secondFunc) {
    return Math.sign(PRIORITYS[firstFunc.name] - PRIORITYS[secondFunc.name]);
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var functions = [].slice.call(arguments, 1);
    if (functions.length === 0) {
        return collection;
    }
    functions.sort(sortFunctions);
    var collectionCopy = doCopyCollection(collection);
    functions.forEach(function (func) {
        collectionCopy = func(collectionCopy);
    });

    return collectionCopy;
};


/**
 * Выбор полей
 * @params {...String}
 * @returns {function}
 */
exports.select = function () {
    var fields = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(function (item) {
            return fields.reduce(function (changedItem, field) {
                if (item.hasOwnProperty (field)) {
                    changedItem[field] = item[field];
                }

                return changedItem;
            }, {});
        });
    };
};


/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {function}
 */
exports.filterIn = function (property, values) {

    return function filterIn(collection) {
        return collection.filter(function (filterByValues) {
            return values.indexOf(filterByValues[property]) !== -1;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {function}
 */
exports.sortBy = function (property, order) {

    return function sortBy(collection) {
        var changedCollection = collection.sort(function (firstRec, secondRec) {
            return (firstRec[property] > secondRec[property]);
        });

        return order === 'asc' ? changedCollection : changedCollection.reverse();
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {function}
 */
exports.format = function (property, formatter) {

    return function format(collection) {

        return collection.map(function (record) {
            if (record.hasOwnProperty(property)) {
                record[property] = formatter(record[property]);
            }

            return record;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {function}
 */
exports.limit = function (count) {
    count = count > 0 ? count : 0;

    return function limit(collection) {

        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {function}
     */
    exports.or = function () {
        var filterMethods = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(function (item) {
                return filterMethods.some(function (method) {
                    return method(collection).indexOf(item) !== -1;
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {function}
     */
    exports.and = function () {
        var filterMethods = [].slice.call(arguments);

        return function and(collection) {
            return collection.filter(function (item) {
                return filterMethods.every(function (method) {
                    return method(collection).indexOf(item) !== -1;
                });
            });
        };
    };
}
