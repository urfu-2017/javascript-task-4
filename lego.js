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
    return collection.slice();
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...params) {
    let collectionCopy = copyCollection(collection);
    params.sort((a, b) => FUNCTION_ORDER[a.name] - FUNCTION_ORDER[b.name])
        .forEach(func => {
            collectionCopy = func(collectionCopy);
            console.info(collectionCopy);
        });

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = (...params) => {
    return function select(collection) {
        return collection.map(person => {
            let tempPerson = {};
            params.forEach(prop => {
                if (prop in person) {
                    tempPerson[prop] = person[prop];
                }
            });

            return tempPerson;
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
        let tempCollection = [];
        tempCollection = collection.filter(person => {
            return values.some(item => person[property] === item);
        });

        return tempCollection;
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
        return collection.sort((a, b) => (a[property] - b[property]) * (order === 'asc' ? 1 : -1));
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
            if (property in person) {
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
exports.limit = (count) => {
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
    exports.or = (...commands) => {
        return function or(collection) {
            return collection.filter(person => {
                return commands.some(rule => rule(collection).includes(person));
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = (...commands) => {
        return function and(collection) {
            return collection.filter(person => {
                return commands.every(rule => rule(collection).includes(person));
            });
        };
    };
}
