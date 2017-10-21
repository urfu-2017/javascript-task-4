'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

let PRIORITET = ['sortBy', 'filterIn', 'select', 'format', 'limit'];

function copyPaste(collection) {
    return JSON.parse(JSON.stringify(collection));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...commands) {
    let collectionCopy = copyPaste(collection);
    commands = commands.sort(function (a, b) {
        return PRIORITET.indexOf(a.name) - PRIORITET.indexOf(b.name);
    });
    commands.forEach(f => {
        collectionCopy = f(collectionCopy);
    });

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...fields) {
    return function select(collection) {
        return collection.map(item => {
            let selector = {};
            fields.forEach((field) => {
                if (item[field]) {
                    selector[field] = item[field];
                }
            });

            return selector;
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */

exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        let filterCollection = [];
        collection.forEach(item => {
            let finder = values.some(x => {
                return item[property] === x;
            });
            if (finder) {
                filterCollection.push(item);
            }
        });

        return filterCollection;
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */

exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return collection.sort(
            function (a, b) {
                if (a[property] > b[property]) {
                    return order === 'asc' ? 1 : -1;
                }
                if (a[property] < b[property]) {
                    return order === 'asc' ? -1 : 1;
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
 */

exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(item => {
            let itemCopy = copyPaste(item);
            if (itemCopy[property]) {
                itemCopy[property] = formatter(itemCopy[property]);
            }

            return itemCopy;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
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
     */
    exports.or = function () {
        return;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function () {
        return;
    };
}
