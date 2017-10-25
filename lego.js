'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;
let priority = {
    'select': 2,
    'filterIn': 0,
    'format': 3,
    'sortBy': 1,
    'limit': 4
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    let copyCollection = collection.slice();
    let functions = [].slice.call(arguments, 1);
    functions.sort((a, b) => priority[a.name] > priority[b.name]);
    functions.forEach(func => {
        copyCollection = func(copyCollection);
    });

    return copyCollection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    let selectArgs = [].slice.call(arguments);

    return function select(copyCollection) {
        return copyCollection.map(function (copyCollectionItem) {
            let answer = {};
            for (let field in copyCollectionItem) {
                if (selectArgs.indexOf(field) !== -1) {
                    answer[field] = copyCollectionItem[field];
                }
            }

            return answer;
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
    return function filterIn(copyCollection) {
        return copyCollection.filter(a => values.indexOf(a[property]) !== -1);
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    if (order === 'asc') {
        return function sortBy(copyCollection) {
            for (let item of copyCollection) {
                if (!(property in item)) {
                    return copyCollection;
                }
            }

            return copyCollection.sort((a, b) => a[property] > b[property]);
        };
    }

    return function sortBy(copyCollection) {
        for (let item of copyCollection) {
            if (!(property in item)) {
                return copyCollection;
            }
        }

        return copyCollection.sort((a, b) => a[property] > b[property]);
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function format(copyCollection) {
        for (let item of copyCollection) {
            if (!(property in item)) {
                return copyCollection;
            }
        }

        return copyCollection.map(copyCollectionItem => {
            copyCollectionItem[property] = formatter(copyCollectionItem[property]);

            return copyCollectionItem;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limit(copyCollection) {
        if (count > 0) {
            return copyCollection.slice(0, count);
        }

        return [];
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
