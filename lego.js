'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const PRIORITIES = {
    'and': 0,
    'or': 1,
    'filterIn': 2,
    'sortBy': 3,
    'select': 4,
    'limit': 5,
    'format': 6
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...operators) {
    var local = copy(collection);

    return operators
        .sort((op1, op2) => PRIORITIES[op1.name] - PRIORITIES[op2.name])
        .reduce((operated, operator) => operator(operated), local);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...properties) {
    let select = collection => {
        return collection.map(friend => {
            let selected = {};
            properties
                .filter(property => property in friend)
                .forEach(property => {
                    selected[property] = friend[property];
                });

            return selected;
        });
    };

    return select;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    let filterIn = collection => {
        return collection.filter(friend =>
            property in friend && values.includes(friend[property])
        );
    };

    return filterIn;
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    let sortBy = collection => {
        return collection.sort((first, second) => {
            if (first[property] === second[property]) {
                return 0;
            }

            if (order === 'asc') {
                return first[property] < second[property] ? -1 : 1;
            }

            return first[property] > second[property] ? -1 : 1;
        });
    };

    return sortBy;
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) { // eslint-disable-line
    let format = collection => {
        collection.forEach(friend => {
            friend[property] = formatter(friend[property]);
        });

        return collection;
    };

    return format;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) { // eslint-disable-line
    let limit = collection => {
        return collection.slice(0, count);
    };

    return limit;
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function (...operators) {
        let or = collection => {
            return collection.filter(friend =>
                operators.some(operator => operator([friend]).length > 0)
            );
        };

        return or;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...operators) {
        let and = collection => {
            return collection.filter(friend =>
                operators.every(operator => operator([friend]).length > 0)
            );
        };

        return and;
    };
}

function copy(object) {
    return JSON.parse(JSON.stringify(object));
}
