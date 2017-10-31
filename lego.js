'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var FUNCTIONS_PRIORITY = {
    filterIn: 1,
    sortBy: 2,
    and: 3,
    or: 3,
    select: 4,
    limit: 5,
    format: 6
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...functions) {
    let collectionCopy = copy(collection);

    functions.sort(sortFunctions).forEach(func => {
        collectionCopy = func(collectionCopy);
    });

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...properties) {
    return function select(collection) {
        let collectionCopy = copy(collection);

        return collectionCopy.map(element => {
            let newElement = {};

            for (let key in element) {
                if (contains(properties, key)) {
                    newElement[key] = element[key];
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
    return function filterIn(collection) {
        return collection.filter(element => contains(values, element[property]));
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
        let collectionCopy = copy(collection);

        return collectionCopy.sort((a, b) => {
            return (order === 'asc') ? a[property] > b[property]
                : a[property] < b[property];
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
        let collectionCopy = copy(collection);

        return collectionCopy.map(element => {
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
        let collectionCopy = copy(collection);

        return collectionCopy.slice(0, count);
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
        return function or(collection) {
            let collectionCopy = copy(collection);

            return collectionCopy.filter(element => {
                for (let filter of filters) {
                    if (elementRemainsAfterFilter(element, filter)) {
                        return true;
                    }
                }

                return false;
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...filters) {
        return function and(collection) {
            let collectionCopy = copy(collection);

            return collectionCopy.filter(element => {
                for (let filter of filters) {
                    if (!elementRemainsAfterFilter(element, filter)) {
                        return false;
                    }
                }

                return true;
            });
        };
    };
}

function copy(someObject) {
    return JSON.parse(JSON.stringify(someObject));
}

function contains(arr, elem) {
    return arr.includes(elem);
}

function sortFunctions(a, b) {
    return FUNCTIONS_PRIORITY[a.name] - FUNCTIONS_PRIORITY[b.name];
}

function elementRemainsAfterFilter(element, filter) {
    let collectionFromElement = [element];

    return filter(collectionFromElement).length === 1;
}
