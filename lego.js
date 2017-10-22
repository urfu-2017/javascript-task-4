'use strict';

let FUNCTION_PRIORITIES = {
    select: 3,
    filterIn: 1,
    sortBy: 2,
    format: 4,
    limit: 5,
    or: 1,
    and: 1
};

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    return functions.sort((a, b) => FUNCTION_PRIORITIES[a.name] - FUNCTION_PRIORITIES[b.name])
        .reduce((value, func) => func(value), copyObject(collection));
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...properties) {
    return function select(col) {
        let result = col.map(
            obj => {
                let resultObj = {};
                properties.filter(p => p in obj)
                    .forEach(p => (resultObj[p] = obj[p]));

                return resultObj;
            });

        return result;
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function filterIn(col) {
        return col.filter(obj => values.includes(obj[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    return function sortBy(col) {
        return col
            .sort((a, b) => (order === 'asc' ? 1 : -1) * (a[property] > b[property] ? 1 : -1));
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function format(col) {
        return col.map(obj => {
            obj[property] = formatter(obj[property]);

            return obj;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limit(col) {
        return col.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...filters) {
        return function or(col) {
            return col.filter(obj => filters.some(filter => filter([obj]).length));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...filters) {
        return function and(col) {
            return col.filter(obj => filters.every(filter => filter([obj]).length));
        };
    };
}

function copyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}
