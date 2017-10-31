'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    let functionWeight = {
        'sortBy': 0,
        'filterIn': 0,
        'select': 1,
        'format': 2,
        'limit': 2
    };
    let functions = Array.from(arguments).splice(1);
    functions.sort((f1, f2) => functionWeight[f1.name] - functionWeight[f2.name]);
    let result = collection;
    for (let func of functions) {
        result = func(result);
    }

    return result;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    let properties = Array.from(arguments);

    return function select(friends) {
        return friends.map(friend => {
            return properties.reduce((selection, property) => {
                if (friend.hasOwnProperty(property)) {
                    selection[property] = friend[property];
                }

                return selection;
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
    return function filterIn(friends) {
        return friends.filter(friend => values.includes(friend[property]));
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
        let friendsCopy = Array.from(friends);
        friendsCopy.sort((fried1, fried2) => {
            if (fried1[property] > fried2[property]) {
                return 1;
            }
            if (fried1[property] < fried2[property]) {
                return -1;
            }

            return 0;
        });

        if (order === 'desc') {
            friendsCopy.reverse();
        }

        return friendsCopy;
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
        let result = [];
        friends.forEach(friend => {
            let copyFried = Object.assign({}, friend);
            copyFried[property] = formatter(copyFried[property]);
            result.push(copyFried);
        });

        return result;

    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limit(friends) {
        return Array.from(friends).slice(0, count);
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
