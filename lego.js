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
exports.query = function (collection) {
    const functionWeight = { 'limit': 1, 'format': 2, 'select': 3, 'filterIn': 4, 'sortBy': 5,
        'or': 6, 'and': 7 };

    return Array.from(arguments).slice(1)
        .sort((firstMethod, secondMethod) => {
            if (functionWeight[firstMethod.name] > functionWeight[secondMethod.name]) {
                return -1;
            }
            if (functionWeight[firstMethod.name] < functionWeight[secondMethod.name]) {
                return 1;
            }

            return 0;
        })
        .reduce((accumulator, method) => {
            return method(accumulator);
        }, collection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    let fields = Array.from(arguments);

    return function select(collection) {
        return collection.map(friend => {
            let cloneFriend = Object.assign({}, friend);
            Object.keys(cloneFriend).forEach(cloneFriendField => {
                if (!fields.includes(cloneFriendField)) {
                    delete cloneFriend[cloneFriendField];
                }
            });

            return cloneFriend;
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {function}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(friend => values.includes(friend[property]));
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
        let collectionClone = collection.slice();
        collectionClone.sort((firstFriend, secondFriend) => {
            if (firstFriend[property] < secondFriend[property]) {
                return -1;
            }
            if (firstFriend[property] > secondFriend[property]) {
                return 1;
            }

            return 0;
        });

        if (order === 'desc') {
            collectionClone.reverse();
        }

        return collectionClone;
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
        return collection.map(friend => {
            let cloneFriend = Object.assign({}, friend);
            cloneFriend[property] = formatter(cloneFriend[property]);

            return cloneFriend;
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
        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {function}
     */
    exports.or = function () {
        const filterIns = Array.from(arguments);

        return function or(collection) {
            return collection.filter(friend => {
                return filterIns.some(filter => {
                    return filter(collection).includes(friend);
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {function}
     */
    exports.and = function () {
        const filterIns = Array.from(arguments);

        return function and(collection) {
            return collection.filter(friend => {
                return filterIns.every(filter => {
                    return filter(collection).includes(friend);
                });
            });
        };
    };
}
