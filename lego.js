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
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    const collectionCopy = collection.map(item => Object.assign({}, item));

    return functions
        .sort((one, other) => FUNCTIONS_PRIORITIES[one.name] - FUNCTIONS_PRIORITIES[other.name])
        .reduce((result, func) => func(result), collectionCopy);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {[Object]}
 */
exports.select = function (...selectedProperties) {
    return function select(collection) {
        return collection.map(item => {
            return selectedProperties
                .filter(property => Object.keys(item).includes(property))
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
 * @returns {[Object]}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection
            .filter(item => values.includes(item[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {[Object]}
 */
exports.sortBy = function (property, order) {
    order = order === 'asc' ? 1 : -1;

    return function sortBy(collection) {
        return collection.sort((one, other) => {
            if (one[property] === other[property]) {
                return 0;
            }

            return one[property] > other[property] ? order : -order;
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {[Object]}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection
            .map(item => {
                if (item.hasOwnProperty) {
                    item[property] = formatter(item[property]);
                }

                return item;
            });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {[Object]}
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
     * @returns {[Object]} - asd
     */
    exports.or = function (...filterFunctions) {
        return function or(collection) {
            return collection
                .filter(item => filterFunctions
                    .some(filterFunction => filterFunction([item]).length > 0)
                );
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {[Object]} - collection
     */
    exports.and = function (...filterFunctions) {
        return function and(collection) {
            return collection
                .filter(item => filterFunctions
                    .every(filterFunction => filterFunction([item]).length > 0)
                );
        };
    };
}
