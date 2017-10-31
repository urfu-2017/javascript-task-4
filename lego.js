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

    return functions.sort((a, b) => a.priority - b.priority)
        .reduce((acc, func) => func.exec(acc), collectionCopy);
};

/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...selectors) {
    return {
        priority: 2,
        exec: collection => collection.reduce((acc, friend) => {
            acc.push(buildSelection(friend));

            return acc;
        }, [])
    };

    function buildSelection(friend) {
        return selectors.reduce((selection, selector) => {
            if (Reflect.has(friend, selector)) {
                selection[selector] = friend[selector];
            }

            return selection;
        }, {});
    }
};


/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */

exports.filterIn = function (property, values) {
    return {
        priority: 0,
        exec: collection => collection.filter(friend => values.includes(friend[property]))
    };
};


/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */

exports.sortBy = function (property, order) {
    return {
        priority: 1,
        exec: collection => collection.sort(comparator)
    };

    function comparator(a, b) {
        if (a[property] < b[property]) {
            return order === 'asc' ? -1 : 1;
        } else if (a[property] > b[property]) {
            return order === 'asc' ? 1 : -1;
        }

        return 0;
    }
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */

exports.format = function (property, formatter) {
    return {
        priority: 3,
        exec: collection =>
            collection.map(friend => {
                if (Reflect.has(friend, property)) {
                    friend[property] = formatter(friend[property]);
                }

                return friend;
            })
    };
};


/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */

exports.limit = function (count) {
    return {
        priority: 3,
        exec: collection => collection.slice(0, count)
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
            exec: collection =>
                collection.filter(friend =>
                    functions.some(filter => filter.exec(collection).includes(friend)))
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
            exec: collection => functions.reduce((acc, filter) => filter.exec(acc), collection)
        };
    };
}
