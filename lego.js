'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const FUNCTIONS_PRECEDENCE = {
    format: 3,
    limit: 3,
    select: 2,
    sortBy: 1,
    or: 0,
    and: 0,
    filterIn: 0
};

// function copyTheCollection(collection) {
//
//         return collection.map(friend => Object.assign({}, friend));
//     }

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */

exports.query = function (collection, ...funcs) {

    return funcs

        .sort(
            function (func1, func2) {

                return FUNCTIONS_PRECEDENCE[func1.name] - FUNCTIONS_PRECEDENCE[func2.name];
            }
        )

        .reduce(

            function (result, func) {

                return func(result);

            }, collection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {

    return function select(collection) {

        return collection.map(item =>

            fields.reduce(function (result, field) {

                if (item.hasOwnProperty(field)) {

                    result[field] = item[field];
                }

                return result;

            }, {})
        );
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

        return collection

            .filter(obj => values.indexOf(obj[property]) !== -1);
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {

    // console.info(property, order);

    return function sortBy(collection) {

        if (order === 'asc') {
            order = 1;
        } else {
            order = -1;
        }

        return collection

            .slice()

            .sort(function (obj1, obj2) {

                if (obj1[property] === obj2[property]) {

                    return 0;
                }

                if (obj1[property] > obj2[property]) {

                // return -order
                    return order;
                }

                return -order;

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

    // console.info(property, formatter);

    return function format(collection) {

        // if (!(collection.every(friend => property in friend))) {
        //
        //     return collection;
        //
        // }

        // return collection.map(obj => {
        //
        //     obj[property] = formatter(obj[property]);
        //
        //     return obj;
        // });

        return collection.map(item =>

            Object.assign({}, item, {

                [property]: formatter(item[property])
            })

        );
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {

    // return collection.slice(0, count);

    return function limit(collection) {

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
    exports.or = function () {

        let functions = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(

                obj => functions.some(func => func(collection).indexOf(obj) !== -1));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {

        let functions = [].slice.call(arguments);

        return function and(collection) {

            return collection.filter(

                obj => functions.every(func => func(collection).indexOf(obj) !== -1));

        };
    };
}
