'use strict';

exports.isStar = false;

const PRIORITIES = {
    filterIn: 1,
    sortBy: 2,
    select: 3,
    format: 4,
    limit: 5
};

function copyCollection(collection) {
    return collection.map(element => Object.assign({}, element));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    let copiedCollection = copyCollection(collection);
    functions = functions.sort((firstFunc, secondFunc) =>
        PRIORITIES[firstFunc.name] - PRIORITIES[secondFunc.name]);
    functions.forEach(func => {
        copiedCollection = func(copiedCollection);
    });

    return copiedCollection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Object}
 */
exports.select = function (...properties) {
    return function select(collection) {
        return collection.map(element =>
            properties
                .reduce((result, property) => {
                    result[property] = element[property];

                    return result;
                }, {})
        );
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

        return collection.filter(element => values.indexOf(element[property]) !== -1);
    };
};

/**
 * Сортировка коллекции по полю ************
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Fuction}
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        let copiedCollection = copyCollection(collection);

        return copiedCollection.sort((first, second) =>
            (order === 'asc') ? first[property] > second[property]
                : first[property] < second[property]);
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

        return collection.map(element => {
            element[property] = formatter(element[property]);

            return element;
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
