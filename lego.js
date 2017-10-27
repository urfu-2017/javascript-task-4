'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const FUNCTION_ORDER = {
    filterIn: 1,
    or: 2,
    and: 3,
    sortBy: 4,
    select: 5,
    limit: 6,
    format: 7
};

function copyCollection(collection) {
    return collection.map(person => Object.assign({}, person));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...params) {
    let collectionCopy = copyCollection(collection);

    return params
        .sort((a, b) => FUNCTION_ORDER[a.name] - FUNCTION_ORDER[b.name])
        .reduce((acc, func) => func(acc), collectionCopy);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = (...params) => {
    return function select(collection) {
        return collection.map(person => {
            return params.reduce((newPerson, prop) => {
                if (person.hasOwnProperty(prop)) {
                    newPerson[prop] = person[prop];
                }

                return newPerson;
            }, {});
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = (property, values) => {
    return function filterIn(collection) {
        return collection
            .filter(person => values.some(item => person[property] === item));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = (property, order) => {
    return function sortBy(collection) {
        const sortOrder = order === 'asc' ? 1 : -1;

        return collection.sort((a, b) => {
            if (a[property] > b[property]) {
                return sortOrder;
            } else if (a[property] < b[property]) {
                return -1 * sortOrder;
            }

            return 0;
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = (property, formatter) => {
    return function format(collection) {
        return collection.map(person => {
            if (person.hasOwnProperty(property)) {
                person[property] = formatter(person[property]);
            }

            return person;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = count => {
    return function limit(collection) {
        return count > 0 ? collection.slice(0, count) : [];
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = (...filters) => {
        return function or(collection) {
            return collection.filter(person => {
                return filters.some(rule => Boolean(rule([person]).length));
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = (...filters) => {
        return function and(collection) {
            return collection.filter(person => {
                return filters.every(rule => Boolean(rule([person]).length));
            });
        };
    };
}
