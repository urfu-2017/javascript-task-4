'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;


const funcPriority = {
    select: 2,
    filterIn: 0,
    sortBy: 1,
    format: 3,
    limit: 3,
    or: 0,
    and: 0
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @returns {Array}
 */
exports.query = function (collection) {
    let functions = [].slice.call(arguments, 1);
    let copyArray = collection.map(friend => Object.assign({}, friend));
    functions.sort((a, b) => funcPriority[a.name] > funcPriority[b.name]);
    for (let func of functions) {
        copyArray = func(copyArray);
    }

    return copyArray;
};

/**
 * Выбор полей
 * @param {...String} fields
 * @returns {Function}
 */
exports.select = function (...fields) {
    return function select(collection) {
        return collection.map(item => {
            let selector = {};
            for (let field of fields) {
                if (item[field]) {
                    selector[field] = item[field];
                }
            }

            return selector;
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
        let changedCollection = [];
        for (let item of collection) {
            let isFound = values.some(x => {
                return item[property] === x;
            });
            if (isFound) {
                changedCollection.push(item);
            }
        }

        return changedCollection;
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
        return collection.sort(
            function (a, b) {
                if (a[property] < b[property]) {
                    return (order === 'asc') ? -1 : 1;
                }
                if (a[property] > b[property]) {
                    return (order === 'asc') ? 1 : -1;
                }

                return 0;
            }
        );
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
        let copyArray = collection.map(friend => Object.assign({}, friend));

        return copyArray.map(item => {
            if (item[property]) {
                item[property] = formatter(item[property]);
            }

            return item;
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
        let filters = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(friend =>
                filters.some(filter =>
                    filter(collection).indexOf(friend) !== -1
                ));
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        let filters = [].slice.call(arguments);

        return function and(collection) {
            return collection.filter(
                friend => filters.every(filter =>
                    filter(collection).indexOf(friend) !== -1
                ));
        };
    };
}
