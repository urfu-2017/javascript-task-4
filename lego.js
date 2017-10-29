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
exports.query = function (collection, ...functions) {
    let copyCollection = collection.slice();
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
exports.select = function (...selectArgs) {
    return function select(copyCollection) {
        return copyCollection.map(copyCollectionItem => {
            let answer = {};
            for (let field of selectArgs) {
                if (field in copyCollectionItem) {
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
    return function sortBy(copyCollection) {
        if (order === 'asc') {
            return copyCollection.sort((a, b) => a[property] > b[property]);
        }

        return copyCollection.sort((a, b) => a[property] < b[property]);
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
        return copyCollection.map(copyCollectionItem => {
            let newСopyCollectionItem = Object.assign({}, copyCollectionItem);
            newСopyCollectionItem[property] = formatter(newСopyCollectionItem[property]);

            return newСopyCollectionItem;
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
