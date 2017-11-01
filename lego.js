'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const DESCENDING_ORDER = 'desc';

const OPERATOR_PRIORITY = {
    andFunc: 1,
    orFunc: 2,
    filterInFunc: 3,
    sortFunc: 4,
    selectFunc: 5,
    limitFunc: 6,
    formatFunc: 7
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */


exports.query = function (collection, ...operators) {
    let copiedCollection = copyCollection(collection);

    return operators
        .sort((o1, o2) => OPERATOR_PRIORITY[o1.name] - OPERATOR_PRIORITY[o2.name])
        .reduce((currentCollection, operator) => operator(currentCollection), copiedCollection);
};

function copyCollection(collection) {
    return JSON.parse(JSON.stringify(collection));
}

/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...requiredFields) {
    let selectFunc = (collection) => collection.map(function (item) {
        let itemWithSelectedFields = {};
        Object.keys(item)
            .filter(x => requiredFields.includes(x))
            .forEach(function (fieldName) {
                itemWithSelectedFields[fieldName] = item[fieldName];
            });

        return itemWithSelectedFields;
    });

    return selectFunc;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function filterInFunc(collection) {
        return collection.filter(item =>
            item.hasOwnProperty(property) && values.includes(item[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */

exports.sortBy = function (property, order) {
    return function sortFunc(collection) {
        collection.sort(function (item1, item2) {
            let orderSwitch = (order === DESCENDING_ORDER ? -1 : 1);
            if (typeof item1[property] === 'number' || typeof item2[property] === 'number') {
                return orderSwitch * (item1[property] - item2[property]);
            }

            return orderSwitch * compareValues(item1[property], item2[property]);
        });

        return collection;
    };
};

function compareValues(value1, value2) {
    if (value1 === value2) {
        return 0;
    }

    return value1 > value2 ? 1 : -1;
}

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */

exports.format = function (property, formatter) {
    return function formatFunc(collection) {
        let copiedCollection = copyCollection(collection);

        return copiedCollection.map(function (item) {
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
 * @returns {Array}
 */
exports.limit = function (count) {
    return function limitFunc(collection) {
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
    exports.or = function (...filterFunctions) {
        return function orFunc(collection) {
            let filtersResults = filterFunctions
                .map(filter => filter(collection))
                .reduce(function (a, b) {
                    return a.concat(b);
                });

            return collection.filter(item => filtersResults.includes(item));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...filterFunctions) {
        return function andFunc(collection) {
            return filterFunctions.reduce((coll, filter) => filter(coll), collection);
        };
    };
}
