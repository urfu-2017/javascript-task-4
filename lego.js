/* eslint-disable valid-jsdoc,linebreak-style */
'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

let EXPR_ORDER = ['and', 'or', 'filterIn', 'sortBy', 'select', 'format', 'limit'];

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...commands) {
    let potatoCollection = collection.map(friend => Object.assign({}, friend));
    commands.sort(function (a, b) {
        return EXPR_ORDER.indexOf(a.name) - EXPR_ORDER.indexOf(b.name);
    });
    commands.forEach(f => {
        potatoCollection = f(potatoCollection);
    });

    return potatoCollection;
};


/**
 * Выбор полей
 * @params {...String}
 */
exports.select = function (...commands) {
    return function select(collection) {
        return collection.map(el =>
            commands.reduce((newObjOfFriends, field) => {
                if (el[field] !== undefined) {
                    newObjOfFriends[field] = el[field];
                }

                return newObjOfFriends;
            }, {})
        );
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */
exports.filterIn = function filterIn(property, values) {
    return collection => collection.filter(el =>
        values.some(value =>
            el[property] === value));
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */
exports.sortBy = function sortBy(property, order) {
    return collection => {
        let funcSort = (property === 'age')
            ? (a, b) => {
                return a - b;
            }
            : (a, b) => a.localeCompare(b);
        collection.sort((a, b) => funcSort(a[property], b[property]));
        if (order === 'desc') {
            return collection.reverse();
        }

        return collection;
    };

};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */
exports.format = function format(property, formatter) {
    return collection => collection.map(el =>
        Object.assign({}, el, { [property]: formatter(el[property]) })
    );
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */
exports.limit = (count) =>
    function limit(collection) {
        return collection.slice(0, count);
    };

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.or = (...commands) =>
        function or(collection) {
            return collection.filter(item =>
                commands.some(func => func([item]).length > 0));
        };


    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = (...commands) =>
        function and(collection) {
            return collection.filter(item =>
                commands.every(func => func([item]).length > 0));
        };
}
