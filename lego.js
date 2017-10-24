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
exports.query = function (collection, ...functions) {
    let collectionCopy = JSON.parse(JSON.stringify(collection));
    let instructions = functions.sort((a, b) => {
        return a.priority - b.priority;
    });

    return instructions.reduce((acc, func) => {
        acc = func.exec(acc);

        return acc;
    }, collectionCopy);
};

/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...selectors) {
    return {
        priority: 3,
        exec: collection => {
            return collection.reduce((acc, friend) => {
                acc.push(selectors.reduce((selection, selector) => {
                    if (friend.hasOwnProperty(selector)) {
                        selection[selector] = friend[selector];
                    }

                    return selection;
                }, {}));

                return acc;

            }, []);
        }
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */

exports.filterIn = function (property, values) {
    return {
        priority: 1,
        exec: collection => {
            return collection.filter(friend => {
                for (let value of values) {
                    if (friend[property] === value) {
                        return true;
                    }
                }

                return false;
            });
        }
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */

exports.sortBy = function (property, order) {
    return {
        priority: 2,
        exec: collection => {
            let sortedCollection = collection.sort((a, b) => {
                if (a[property] < b[property]) {
                    return -1;
                } else if (a[property] > b[property]) {
                    return 1;
                }

                return 0;
            });
            if (order === 'desc') {
                return sortedCollection.reverse();
            }

            return sortedCollection;
        }
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */

exports.format = function (property, formatter) {
    return {
        priority: 4,
        exec: collection => {
            return collection.map(friend => {
                if (friend.hasOwnProperty(property)) {
                    friend[property] = formatter(friend[property]);
                }

                return friend;
            });
        }
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */

exports.limit = function (count) {
    return {
        priority: 4,
        exec: collection => {
            return collection.slice(0, count);
        }
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */

    exports.or = function (...functions) {
        return {
            priority: 0,
            exec: collection => {
                return functions.reduce((acc, filter) => {
                    filter.exec(collection).forEach(friend => {
                        if (!acc.includes(friend)) {
                            acc.push(friend);
                        }
                    });

                    return acc;
                }, []);
                // return collection.filter(friend =>
                //     functions.some(filter => filter.exec(collection).includes(friend)));
            }
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */

    exports.and = function (...functions) {
        return {
            priority: 0,
            exec: collection => {
                return functions.reduce((acc, filter) => {
                    acc = filter.exec(acc);

                    return acc;
                }, collection);
            }
        };
    };
}
