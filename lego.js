'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const FUNCTIONS_ORDER = {
    'filter': 0,
    'and': 0,
    'or': 0,
    'sort': 1,
    'select': 2,
    'format': 3,
    'limit': 4
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    let result = deepCopy(collection);
    functions.sort((a, b) => {
        return FUNCTIONS_ORDER[a.name] - FUNCTIONS_ORDER[b.name];
    });

    for (const func of functions) {
        result = func(result);
    }

    return result;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Object} - Операция выбора
 */
exports.select = function (...selectFields) {
    return function select(collection) {
        return collection.map(item => {
            const result = {};
            Object.keys(item)
                .filter(key => selectFields.includes(key))
                .forEach(key => {
                    result[key] = item[key];
                });

            return result;
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Object} - Операция фильтрации
 */
exports.filterIn = function (property, values) {
    return function filter(collection) {
        return collection.filter(item => values.includes(item[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Object} - Операция сортировки
 */
exports.sortBy = function (property, order) {
    return function sort(collection) {
        const collectionCopy = collection.slice();
        collectionCopy.sort((a, b) => {
            let result = 0;
            if (a[property] < b[property]) {
                result = -1;
            }
            if (a[property] > b[property]) {
                result = 1;
            }
            if (order === 'desc') {
                result *= -1;
            }

            return result;
        });

        return collectionCopy;
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Object} - Операция форматирования
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(item => {
            const itemCopy = deepCopy(item);
            itemCopy[property] = formatter(item[property]);

            return itemCopy;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Object} - Операция ограничения количества элементов
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
     * @returns {Object} - Операция OR для фильтрующих функций
     */
    exports.or = function (...functions) {
        return function or(collection) {
            return unique(functions
                .map(func => func(collection))
                .reduce((c1, c2) => c1.concat(c2), []));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object} - Операция AND для фильтрующих функций
     */
    exports.and = function (...functions) {
        return function and(collection) {
            return functions.reduce((result, func) => func(result), collection);
        };
    };
}

function unique(array) {
    return [...new Set(array)];
}

function deepCopy(object) {
    return JSON.parse(JSON.stringify(object));
}
