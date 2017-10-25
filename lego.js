'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

let functionPriority = ['filterIn', 'sortBy', 'limit', 'select', 'format'];

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...qFunctions} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...qFunctions) {
    qFunctions.sort(function (a, b) {
        return functionPriority.indexOf(a.name) - functionPriority.indexOf(b.name);
    });

    return qFunctions.reduce(function (acc, func) {
        return func(acc);
    }, collection);
};


/**
 * Выбор полей
 * @params {...String}
 * @returns {Array}
 */
exports.select = function (...params) {

    return function select(collection) {
        return collection.map(function (record) {
            return params.reduce(function (newObj, param) {
                if (record[param] !== undefined) {
                    newObj[param] = record[param];
                }

                return newObj;
            }, {});
        });
    };
};


/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Array}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(function (record) {
            return values.includes(record[property]);
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Array}
 */
exports.sortBy = function (property, order) {
    let sign = (order === 'asc') ? 1 : -1;

    return function sortBy(collection) {
        return collection.slice().sort(function (a, b) {

            if (a[property] < b[property]) {
                return -sign;
            }
            if (a[property] > b[property]) {
                return sign;
            }

            return 0;
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Array}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (record) {
            let copy = Object.keys(record).reduce(function (newObj, param) {
                newObj[param] = record[param];

                return newObj;
            }, {});
            copy[property] = formatter(copy[property]);

            return copy;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Array}
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
    exports.or = function (...qFunctions) {
        return function or(collection) {
            return collection.filter(function (record) {
                return qFunctions.some(function (func) {
                    return func(collection).includes(record);
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
    exports.and = function (...qFunctions) {
        return function and(collection) {
            return collection.filter(function (record) {
                return qFunctions.every(function (func) {
                    return func(collection).includes(record);
                });
            });
        };
    };
}
