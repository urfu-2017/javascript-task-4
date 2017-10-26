'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

let FUNC_PRIORITIES = {
    limit: 2,
    format: 2,
    select: 1,
    sortBy: 0,
    filterIn: 0
};

function copyCollerction(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    return functions.sort((a, b) => FUNC_PRIORITIES[a.name] - FUNC_PRIORITIES[b.name])
        .reduce((value, func) => func(value), copyCollerction(collection));
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {
    return function select(col) {
        return col.map(e => {
            let newElement = {};
            for (var field of Object.keys(e)) {
                if (fields.includes(field)) {
                    newElement[field] = e[field];
                }
            }

            return newElement;
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
    return function filterIn(col) {
        return col.filter(element => values.includes(element[property]));
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
        return col.sort(function (a, b) {
            let ord = order === 'asc' ? 1 : -1;

            return ord * a[property] > b[property] ? 1 : -1;
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
     */
    exports.or = function () {
        return;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function () {
        return;
    };
}
