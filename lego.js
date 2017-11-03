'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */

exports.isStar = false;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */

let lodash = require('./node_modules/lodash');

const OPERATORS = {
    sorting: 0,
    filterPersons: 1,
    needFields: 2,
    toFormat: 3,
    limit: 4
};

function clone(collection) {
    return lodash.cloneDeep(collection);
}

exports.query = function (collection, ...operators) {
    let newCollection = clone(collection);
    operators.sort((a, b) => {

        return OPERATORS[a.name] > OPERATORS[b.name] ? 1 : -1;
    });

    return operators.reduce((result, operator) => {
        return operator(result);
    }, newCollection);
};

/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...args) {
    return function needFields(collection) {
        return collection.map((person) => {

            return args.reduce((res, arg) => {
                if (person.hasOwnProperty(arg)) {
                    res[arg] = person[arg];
                }

                return res;
            }, {});
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */

exports.filterIn = function (property, values) {
    return function filterPersons(collection) {
        let filtered = collection.filter((person) => {
            return values.includes(person[property]);
        });

        return filtered;
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */

exports.sortBy = function (property, order) {
    return function sorting(collection) {
        collection.sort((a, b) => {
            return order === 'asc' ? a[property] > b[property] : a[property] < b[property];
        });

        return collection;
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */

exports.format = function (property, formatter) {
    return function toFormat(collection) {
        return collection.map((person) => {
            if (person[property]) {
                person[property] = formatter(person[property]);
            }

            return person;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
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
