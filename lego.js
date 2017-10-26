'use strict';

const FUNCTIONS_PRIORITIES = {
    'filterIn': 10,
    'and': 20,
    'or': 30,
    'sortBy': 40,
    'select': 50,
    'limit': 60,
    'format': 70
};

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Object[]} collection
 * @params {...Function} – Функции для запроса
 * @returns {Object[]}
 */
exports.query = function (collection, ...functions) {
    const collectionCopy = collection.map(item => Object.assign({}, item));

    return functions
        .sort((a, b) => FUNCTIONS_PRIORITIES[a.name] - FUNCTIONS_PRIORITIES[b.name])
        .reduce((result, func) => func(result), collectionCopy);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {function(Object[])}
 */
exports.select = function (...selectedProperties) {
    return function select(collection) {
        return collection.map(item => {
            return selectedProperties
                .filter(property => item.hasOwnProperty(property))
                .reduce((result, property) => {
                    result[property] = item[property];

                    return result;
                }, {});
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {function(Object[])}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(item => values.includes(item[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {function(Object[])}
 */
exports.sortBy = function (property, order) {
    const anOrder = order === 'asc' ? 1 : -1;

    return function sortBy(collection) {
        return collection.sort((a, b) => {
            if (a[property] === b[property]) {
                return 0;
            }

            return a[property] > b[property] ? anOrder : -anOrder;
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {function(Object[])}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(item => {
            if (item.hasOwnProperty(property)) {
                item[property] = formatter(item[property]);
            }

            return item;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {function(Object[])}
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
     * @returns {function(Object[])}
     */
    exports.or = function (...filterFunctions) {
        return function or(collection) {
            return collection
                .filter(item => filterFunctions
                    .some(filterFunction => filterFunction([item]).length)
                );
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {function(Object[])}
     */
    exports.and = function (...filterFunctions) {
        return function and(collection) {
            return collection
                .filter(item => filterFunctions
                    .every(filterFunction => filterFunction([item]).length)
                );
        };
    };
}
