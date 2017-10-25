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
exports.query = function (collection) {
    const functionPriority = {
        'sortByProperty': 0, 'filterInByProperty': 1,
        'selectByFields': 2, 'limitCount': 3, 'formatProperty': 4,
        'orFilters': 0, 'andFilters': 0
    };
    const collectionCopy = JSON.parse(JSON.stringify(collection));
    if (arguments.length === 1) {
        return collectionCopy;
    }
    const functionQueue = Array.from(arguments).slice(1);
    functionQueue.sort((a, b) => functionPriority[a.name] - functionPriority[b.name]);

    return functionQueue.reduce((result, func) => func(result), collectionCopy);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fields) {
    return function selectByFields(collection) {
        return collection.reduce((friends, friend) => {
            const man = Object.keys(friend).reduce((person, field) => {
                if (fields.includes(field)) {
                    person[field] = friend[field];
                }

                return person;
            }, {});
            friends.push(man);

            return friends;
        }, []);
    };
};


/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function filterInByProperty(collection) {
        return collection.filter(function (friend) {
            return values.includes(friend[property]);
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
    return function sortByProperty(collection) {
        collection.sort((a, b) => {
            if (a[property] > b[property]) {
                return 1;
            }
            if (a[property] < b[property]) {
                return -1;
            }

            return 0;
        });
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
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function formatProperty(collection) {
        return collection.reduce((result, friend) => {
            friend[property] = formatter(friend[property]);
            result.push(friend);

            return result;
        }, []);
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limitCount(collection) {
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
    exports.or = function (...filters) {
        return function orFilters(collection) {
            return collection.reduce((result, friend) => {
                if (filters.some(func => func([friend]).length !== 0)) {
                    result.push(friend);
                }

                return result;
            }, []);
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function (...filters) {
        return function andFilters(collection) {
            return collection.reduce((result, friend) => {
                if (filters.every(func => func([friend]).length !== 0)) {
                    result.push(friend);
                }

                return result;
            }, []);
        };
    };
}
