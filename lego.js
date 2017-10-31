'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */

exports.isStar = true;

const FUNCTION_PRIORITY = {
    limit: 4,
    format: 4,
    select: 3,
    or: 2,
    add: 2,
    sortBy: 1,
    filterIn: 1
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */

exports.query = function (collection, ...operators) {
    let newCollection = collection.map((record) => {
        return Object.assign({}, record);
    });

    return operators
        .sort((firstFunction, secondFunction) => {
            return FUNCTION_PRIORITY[firstFunction.name] - FUNCTION_PRIORITY[secondFunction.name];
        })
        .reduce((currentCollection, fun) => {
            return fun(currentCollection);
        }, newCollection);
};

/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...fields) {
    return function select(collection) {
        return collection.map((record) => {
            let newRecord = {};
            fields.forEach((key) => {
                if (key in record) {
                    newRecord[key] = record[key];
                }
            });

            return newRecord;
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
        return collection.filter((record) => {
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
    return function sortBy(collection) {
        return collection.sort((firstRecord, secondRecord) => {
            let ascending = (firstRecord[property] > secondRecord[property]) ? 1 : -1;

            return order === 'asc' ? ascending : -ascending;
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
        return collection.map((record) => {
            record[property] = formatter(record[property]);

            return record;
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

    exports.or = function (...functions) {
        return function or(collection) {
            return collection.filter((record) => {
                return functions.some((fun) => {
                    return fun(collection).includes(record);
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     *@returns {Array}
     */

    exports.and = function (...functions) {
        return function and(collection) {
            return functions.reduce((filteredCollection, filterFunction) => {
                return filterFunction(filteredCollection);
            }, collection);
        };
    };
}
