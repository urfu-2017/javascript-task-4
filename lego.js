'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;


const PRIORITIES = {
    and: -1,
    or: 0,
    filterIn: 1,
    sortBy: 2,
    select: 3,
    limit: 4,
    format: 5
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    let orderedFunctions = functions.sort((a, b) => PRIORITIES[a.name] - PRIORITIES[b.name]);
    let copyCollection = JSON.parse(JSON.stringify(collection));

    return orderedFunctions.reduce((changedCollection, func) =>
        func(changedCollection), copyCollection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {
    return function select(collection) {
        collection.forEach(record => {
            Object.keys(record).forEach(field => {
                if (!fields.includes(field)) {
                    delete record[field];
                }
            });
        });

        return collection;
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
        return collection.filter(record => values.includes(record[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        let orderMultiplier = order === 'asc' ? 1 : -1;
        collection.sort((a, b) => {
            let orderNumber = 0;
            switch (typeof a[property]) {
                case 'string':
                    orderNumber = a[property].localeCompare(b[property]);
                    break;
                case 'number':
                    orderNumber = a[property] - b[property];
                    break;
                default:
                    break;
            }

            return orderNumber * orderMultiplier;
        });

        return collection;
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
        collection.forEach(record => {
            record[property] = formatter(record[property]);
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
        collection.length = count;

        return collection;
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...filterFunctions) {
        return function or(collection) {
            return collection.filter(record =>
                filterFunctions.some(filter => {
                    let filtredCollection = filter(collection);

                    return filtredCollection.includes(record);
                })
            );
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...filterFunctions) {
        return function and(collection) {
            return filterFunctions.reduce(
                (changedCollection, filter) => filter(changedCollection),
                collection
            );
        };
    };
}
