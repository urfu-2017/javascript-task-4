'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

const PRIORYTY_ARGUMENTS = {
    and: 0,
    or: 0,
    filterIn: 0,
    sortBy: 1,
    select: 2,
    limit: 3,
    format: 4
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var copyCollection = [].concat(collection);
    var orderedArguments = Array.from(arguments).slice(1)
        .sort((a, b) => PRIORYTY_ARGUMENTS[a.name] - PRIORYTY_ARGUMENTS[b.name]);

    return orderedArguments.reduce((result, argument) => argument(result), copyCollection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Array}
 */
exports.select = function () {
    var parametrs = Array.from(arguments);

    return function select(collection) {

        return collection.map(person => {
            var newPerson = {};
            for (var i = 0; i < parametrs.length; i++) {
                if (parametrs[i] in person) {
                    newPerson[parametrs[i]] = person[parametrs[i]];
                }
            }

            return newPerson;
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Array}
 */
exports.filterIn = function (property, values) {

    return function filterIn(collection) {

        return collection.filter(person => values.includes(person[property]));
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Array}
 */
exports.sortBy = function (property, order) {

    return function sortBy(collection) {
        var sortedCollection = collection.sort(function (a, b) {
            if (a[property] > b[property]) {

                return 1;
            }
            if (a[property] < b[property]) {

                return -1;
            }

            return 0;
        });
        if (order === 'desc') {

            return sortedCollection.reverse();
        }

        return sortedCollection;
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Array}
 */
exports.format = function (property, formatter) {

    return function format(collection) {

        return collection.map(function (person) {
            if (person[property] !== undefined) {
                person[property] = formatter(person[property]);
            }

            return person;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Array}
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
     * @returns {Array}
     */
    exports.or = function () {
        var subQuery = Array.from(arguments);

        return function or(collection) {
            var properElement = subQuery.reduce((result, currentFilter) =>
                result.concat(currentFilter(collection)), []);

            return collection.filter(person => properElement.includes(person));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.and = function () {
        var subQuery = Array.from(arguments);

        return function and(collection) {

            return subQuery.reduce((result, currentFilter) => currentFilter(result), collection);
        };
    };
}
