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

function fullCopy(collection) {
    return collection.map(friend => Object.assign({}, friend));
}

exports.query = function (collection) {
    let functions = [].slice.call(arguments).slice(1);

    return handlingOfFunctions(functions)
        .reduce((_collection, _function) => _function(_collection), fullCopy(collection));
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    let properties = [].slice.call(arguments);

    return function _select(collection) {
        return collection.map(friend => {
            let newFriend = {};

            for (let property of Object.keys(friend)) {
                if (properties.includes(property)) {
                    newFriend[property] = friend[property];
                }
            }

            return newFriend;
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
    return function _filterIn(collection) {
        return collection.filter(friend => values.includes(friend[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    return function _sortBy(collection) {
        collection.sort(function (a, b) {
            let first = a[property];
            let second = b[property];

            if (first < second) {
                return -1;
            } else if (first > second) {
                return 1;
            }

            return 0;
        });
        if (order === 'desc') {
            collection.reverse();
        }

        return collection;
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function _format(collection) {
        return collection.map(friend => {
            friend[property] = formatter(friend[property]);

            return friend;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function _limit(collection) {
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
        let conditions = [].slice.call(arguments);

        return function _or(collection) {
            return collection.filter(friend => conditions
                .some(condition => condition(collection).includes(friend)));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        let conditions = [].slice.call(arguments);

        return function _and(collection) {
            return conditions.reduce((_collection, condition) =>
                condition(_collection), collection);
        };
    };
}

function handlingOfFunctions(functions) {
    let prioritiesOfFunctions = {
        '_and': 1,
        '_or': 2,
        '_filterIn': 3,
        '_sortBy': 4,
        '_select': 5,
        '_format': 6,
        '_limit': 7
    };
    functions.sort(function (a, b) {
        return prioritiesOfFunctions[a.name] - prioritiesOfFunctions[b.name];
    });

    return functions;
}
