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

exports.query = function (collection, ...operatores) {
    if (operatores.length === 0) {
        return collection;
    }

    return operatores.sort((a, b) => a.precedence - b.precedence)
        .reduce((result, operator) => operator.action(result), collection);
};

/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...fields) {
    return { precedence: 3,
        action: function (collection) {
            return collection.map(function (friend) {
                let friendCorrectFields = {};
                for (let field of fields) {
                    if (friend[field] !== undefined) {
                        friendCorrectFields[field] = friend[field];
                    }
                }

                return friendCorrectFields;
            }

            );
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
        precedence: 1,
        action: function (collection) {
            return collection.filter(friend => values.indexOf(friend[property]) !== -1);
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
        precedence: 2,
        action: function (collection) {
            let copyCollection = collection;
            copyCollection.sort(function (a, b) {
                if (a[property] > b[property]) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }

                return 0;
            });
            if (order !== 'asc') {
                return copyCollection.reverse();
            }

            return copyCollection;
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
        precedence: 5,
        action: function (collection) {
            return collection.map(function (friend) {
                let friendCorrectField = friend;
                friendCorrectField[property] = formatter(friend[property]);

                return friendCorrectField;
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
        precedence: 4,
        action: function (collection) {
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

    exports.or = function (...filters) {
        return {
            precedence: 0,
            action: function (collection) {
                return collection.filter(friend => filters.some(entry =>
                    entry.action([friend]).length !== 0));
            }
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */

    exports.and = function (...filters) {
        return {
            precedence: 0,
            action: function (collection) {
                return filters.reduce((result, operator) => operator.action(result), collection);
            }
        };
    };
}
