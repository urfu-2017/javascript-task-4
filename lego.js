'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;


const functionsPriority = {
    select: 1,
    filterIn: 0,
    sortBy: 0,
    format: 2,
    limit: 2,
    or: 0,
    and: 0
};


/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    collection = collection.slice();
    let methods = Array.from(arguments).slice(1);

    return methods.sort((a, b) => functionsPriority[a.name] - functionsPriority[b.name])
        . reduce((friends, method) => {
            return method(friends);
        }, collection);
};


/**
 * Выбор полей
 * @params {...String}
 * @returns {{Function, Number}}
 */
exports.select = function () {
    let selectedFields = Array.from(arguments);

    return function select(collection) {
        return collection.map(oldElement => {
            let element = {};
            for (let field of selectedFields) {
                if (field in oldElement) {
                    element[field] = oldElement[field];
                }
            }

            return element;
        });
    };
};


/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {{Function, Number}}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(element => values.includes(element[property]));
    };
};


/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {{Function, Number}}
 */
exports.sortBy = function (property, order) {
    let sign = (order === 'asc') ? 1 : -1;

    return function sortBy(collection) {
        return collection.sort((a, b) => {
            if (a[property] < b[property]) {
                return -sign;
            }
            if (a[property] > b[property]) {
                return sign;
            }

            return 0;
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {{Function, Number}}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(oldElement => {
            let element = Object.assign({}, oldElement);
            element[property] = formatter(element[property]);

            return element;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {{Function, Number}}
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
     * @returns {{Function, Number}}
     */
    exports.or = function () {
        let methods = Array.from(arguments);

        return function or(collection) {
            return collection.filter(element => {
                return methods.some(method => method(collection).includes(element));
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {{Function, Number}}
     */
    exports.and = function () {
        let methods = Array.from(arguments);

        return function and(collection) {
            return collection.filter(element => {
                return methods.every(method => method(collection).includes(element));
            });
        };
    };
}
