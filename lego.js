'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const PRIORITIES = {
    'filterIn': 3,
    'sortBy': 2,
    'select': 1,
    'format': 0,
    'limit': 0
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    let collectionCopy = JSON.parse(JSON.stringify(collection));
    let functions = Array.from(arguments).slice(1);
    functions.sort((a, b) => PRIORITIES[a.name] > PRIORITIES[b.name] ? -1 : 1);
    for (const func of functions) {
        collectionCopy = func(collectionCopy);
    }

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Array}
 */
exports.select = function () {
    let args = Array.from(arguments);

    return function select(collection) {
        collection.forEach((elem) => {
            for (const property in elem) {
                if (args.indexOf(property) === -1) {
                    delete elem[property];
                }
            }
        });

        return collection;
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
        return collection.filter((elem) => values.indexOf(elem[property]) !== -1);
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Array}
 */
exports.sortBy = function (property, order) {
    let compareFunctions = {
        'asc': (a, b) => a > b ? 1 : -1,
        'desc': (a, b) => a > b ? -1 : 1
    };

    return function sortBy(collection) {
        return collection.sort((elem1, elem2) => {
            return compareFunctions[order](elem1[property], elem2[property]);
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
        collection.forEach((elem) => {
            elem[property] = formatter(elem[property]);
        });

        return collection;
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
    exports.or = function () {
        const filterFunсtions = Array.from(arguments);

        return function or(collection) {
            return collection.filter(
                (elem) => filterFunсtions.some((func) => func(collection).indexOf(elem) !== -1));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.and = function () {
        const filterFunсtions = Array.from(arguments);

        return function and(collection) {
            for (const func of filterFunсtions) {
                collection = func(collection);
            }

            return collection;
        };
    };
}
