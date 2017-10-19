'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

const queue = ['filterIn', 'sortBy', 'and', 'or', 'select', 'format', 'limit'];

function compare(el1, el2) {
    return JSON.stringify(el1) === JSON.stringify(el2);
}

function useFunction(collection, func, funcQueue) {
    if (func.name === funcQueue) {
        collection = func(collection);
    }

    return collection;
}

function contains(iter, item) {
    return iter.some((element) => {
        return compare(element, item);
    });
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    let friendsCopy = collection.slice(0);
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
            let updatedFriend = {};
            for (let key in friend) {
                if (fields.indexOf(key) !== -1) {
                    updatedFriend[key] = friend[key];
                }
            }

            return updatedFriend;
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
        friends = friends.filter((friend) => {
            return (values.indexOf(friend[property]) !== -1);
        });

        return friends;
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
        if (order === 'asc') {
            friends.sort((f1, f2) => {
                if (f1[property] > f2[property]) {
                    return 1;
                }
                if (f1[property] < f2[property]) {
                    return -1;
                }

                return 0;
            });
        } else {
            friends.sort((f1, f2) => {
                if (f1[property] < f2[property]) {
                    return 1;
                }
                if (f1[property] > f2[property]) {
                    return -1;
                }

                return 0;
            });
        }

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
            let result = [];
            for (const filter of filters) {
                let copyFriends = friends.slice(0);
                filter(copyFriends).forEach((friend) => {
                    if (contains(result, friend)) {
                        return;
                    }
                    result.push(friend);
                });
            }

            return result;
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
            filters.forEach((filter) => {
                friends = filter(friends);
            });

            return friends;
        };
    };
}
