'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const queue = ['filterIn', 'and', 'or', 'sortBy', 'select', 'format', 'limit'];

function useFunction(collection, func, funcQueue) {
    if (func.name === funcQueue) {
        collection = func(collection);
    }

    return collection;
}

function copyFriends(collection) {
    let copy = [];
    for (const key in collection) {
        if (collection.hasOwnProperty(key)) {
            copy[key] = Object.assign({}, collection[key]);
        }
    }

    return copy;
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    let friendsCopy = copyFriends(collection);
    let functions = Array.prototype.slice.call(arguments, 1);
    for (let funcQueue of queue) {
        for (let func of functions) {
            friendsCopy = useFunction(friendsCopy, func, funcQueue);
        }
    }

    return friendsCopy;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    const fields = Array.prototype.slice.call(arguments, 0);

    return function select(friends) {
        return friends.map((friend) => {
            for (const key in friend) {
                if (fields.indexOf(key) === -1) {
                    delete friend[key];
                }
            }

            return friend;
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
    return function filterIn(friends) {
        return friends.filter((friend) => {
            return (values.indexOf(friend[property]) !== -1);
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
    return function sortBy(friends) {
        friends.sort((fr1, fr2) => {
            if (fr1[property] === fr2[property]) {
                return 0;
            }
            if (fr1[property] > fr2[property]) {
                if (order === 'asc') {
                    return 1;
                }

                return -1;
            }
            if (order === 'asc') {
                return -1;
            }

            return 1;
        });

        return friends;
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function format(friends) {
        return friends.map((friend) => {
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
    return function limit(friends) {
        return friends.slice(0, count);
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
        const filters = Array.prototype.slice.call(arguments, 0);

        return function or(friends) {
            return friends.filter((friend) => {
                return filters.some((filter) => {
                    return (filter(friends).indexOf(friend) !== -1);
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        const filters = Array.prototype.slice.call(arguments, 0);

        return function and(friends) {
            return friends.filter((friend) => {
                return filters.every((filter) => {
                    return (filter(friends).indexOf(friend) !== -1);
                });
            });
        };
    };
}
