'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var OPERATORS_ORDER = ['or', 'and', 'filterIn', 'sortBy', 'select', 'format', 'limit'];

function copyCollection(collection) {
    return collection.map(function (record) {
        return Object.assign({}, record);
    });
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var copiedCollection = copyCollection(collection);
    var operators = [].slice.call(arguments, 1);

    return operators.sort(function (operator1, operator2) {
        return OPERATORS_ORDER.indexOf(operator1.name) - OPERATORS_ORDER.indexOf(operator2.name);
    })
        .reduce(function (accCollection, operator) {
            return operator(accCollection);
        }, copiedCollection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var properties = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(function (record) {
            return properties.reduce(function (changedRecord, property) {
                if (record.hasOwnProperty(property)) {
                    changedRecord[property] = record[property];
                }

                return changedRecord;
            }, {});
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(function (record) {
            return record.hasOwnProperty(property) && values.indexOf(record[property]) !== -1;
        });
    };
};

function compare(a, b) {
    return a - b;
}

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    var orderCondition = order === 'asc' ? 1 : -1;

    return function sortBy(collection) {
        var copiedCollection = copyCollection(collection);

        return copiedCollection.sort(function (record1, record2) {
            if (!record1.hasOwnProperty(property) || !record2.hasOwnProperty(property)) {
                return 0;
            }
            var compareResult = compare(record1[property], record2[property]);

            return compareResult * orderCondition;
        });
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
     * @returns {Array}
     */
    exports.or = function () {
        var filteringOperators = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(function (record) {
                return filteringOperators.some(function (operator) {
                    return operator(collection).indexOf(record) !== -1;
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.and = function () {
        var filteringOperators = [].slice.call(arguments);

        return function and(collection) {
            return collection.filter(function (record) {
                return filteringOperators.every(function (operator) {
                    return operator(collection).indexOf(record) !== -1;
                });
            });
        };
    };
}
