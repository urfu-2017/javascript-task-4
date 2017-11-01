'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const FUNCTIONS_ORDER = {
    or: 1,
    and: 1,
    filterIn: 1,
    sortBy: 1,
    select: 2,
    limit: 3,
    format: 3
};

function getCollectionCopy(collection) {
    return JSON.parse(JSON.stringify(collection));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} ...functions – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    const functions = Array.from(arguments)
        .slice(1)
        .sort((a, b) => FUNCTIONS_ORDER[a.name] - FUNCTIONS_ORDER[b.name]);
    let copy = getCollectionCopy(collection);

    return functions.reduce((result, func) => func(result), copy);
};

function getNewPerson(person, fields) {
    let newPerson = {};
    for (let property of Object.keys(person)) {
        if (fields.includes(property)) {
            newPerson[property] = person[property];
        }
    }

    return newPerson;
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {

    return function select(collection) {
        return collection.map(person => getNewPerson(person, fields));
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
        return collection
            .filter(person => values.includes(person[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    const signToNum = {
        asc: 1,
        desc: -1
    };
    let sign = signToNum[order];

    return function sortBy(collection) {
        return collection
            .sort((a, b) => {
                let first = a[property];
                let second = b[property];
                let result = 0;
                if (first < second) {
                    result = -1;
                } else if (first > second) {
                    result = 1;
                }

                return result * sign;
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
        collection.forEach(person => {
            person[property] = formatter(person[property]);
        });

        return collection;
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
     * @returns {Function}
     */
    exports.or = function (...funcs) {
        return function or(collection) {
            return collection.filter(item => funcs.some(func => Boolean(func([item]).length)));
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
            return collection.filter(item => funcs.every(func => Boolean(func([item]).length)));
        };
    };
}
