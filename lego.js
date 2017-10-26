'use strict';

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
    let newCollection = collection.slice();
    if (!functions) {
        return newCollection;
    }

    return functions
        .sort(compareFunctions)
        .reduce(function (currentCollection, currentFunction) {
            return currentFunction(currentCollection);
        }, newCollection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {
    return function select(collection) {
        return collection.map(contact => {
            var changedContact = {};
            fields.forEach(field => {
                if (contact.hasOwnProperty(field)) {
                    changedContact[field] = contact[field];
                }
            });

            return changedContact;
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
        return collection.filter(contact => {
            return values.includes(contact[property]);
        });
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
        return collection.slice().sort((a, b) => {
            let method = (order === 'asc') ? 1 : -1;
            if (isNaN(a[property])) {
                return method * a[property].localeCompare(b[property]);
            }

            return method * (a[property] - b[property]);
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
        return collection.map(contact => {
            let changedContact = Object.assign({}, contact);
            changedContact[property] = formatter(contact[property]);

            return changedContact;
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
        if (count < 0) {
            return [];
        }

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
    exports.or = function (...functions) {
        return function or(collection) {
            return functions
                .reduce((current, nextFunction) => {
                    if (typeof current === 'function') {
                        return current(collection).concat(nextFunction(collection));
                    }

                    return current.concat(nextFunction(collection));
                })
                .filter(isUniqueContact);
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...functions) {
        return function and(collection) {
            return functions.reduce(function (currentCollection, currentFunction) {
                return currentFunction(currentCollection);
            }, collection);
        };
    };
}

function isUniqueContact(contact, index, collection) {
    return collection.indexOf(contact) === index;
}

function compareFunctions(a, b) {
    const PRIORITY = {
        and: 0,
        or: 1,
        filterIn: 2,
        sortBy: 2,
        select: 3,
        limit: 4,
        format: 4
    };

    return PRIORITY[a.name] - PRIORITY[b.name];
}
