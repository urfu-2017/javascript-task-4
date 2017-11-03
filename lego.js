'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

const PRIORITIES = {
    'filterIn': 1,
    'sortBy': 2,
    'select': 3,
    'limit': 4,
    'format': 5
};

function getCopyCollection(collection) {

    return collection.map(function (friend) {
        return Object.assign({}, friend);
    });
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...operators) {

    return operators.sort((a, b) => PRIORITIES[a.name] - PRIORITIES[b.name])
        .reduce(function (stepResult, operator) {
            return operator(stepResult);
        }, getCopyCollection(collection));
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function (...fieldsForSampling) {

    return function select(collection) {

        return collection.map(function (friend) {

            return Object.keys(friend).reduce(function (selectFriend, currentField) {
                if (fieldsForSampling.includes(currentField)) {
                    selectFriend[currentField] = friend[currentField];
                }

                return selectFriend;
            }, {});
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

    return function sortBy(collection) {

        if (order === 'desc') {

            return collection.sort((a, b) => a[property] < b[property]);
        }

        return collection.sort((a, b) => a[property] > b[property]);
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

        return getCopyCollection(collection).map(function (friend) {
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

    return function limit(collection) {

        return collection.slice(0, count < 0 ? 0 : count);
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
