'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

const priority = ['or', 'and', 'filterIn', 'sortBy', 'select', 'format', 'limit'];

const copy = function copyCollection(coll) {
    return JSON.parse(JSON.stringify(coll));
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @param {Array} funcs  – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...funcs) {
    let localCollection = copy(collection);

    funcs.sort(function (func1, func2) {
        return priority.indexOf(func1.name) > priority.indexOf(func2.name);
    })
        .forEach(function (func) {
            localCollection = func.func(localCollection);
        });

    return localCollection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Object}
 */
exports.select = function select(...fields) {
    let slct = (coll) => {
        return coll.map(function (friend) {
            let newItem = {};
            fields.forEach(function (field) {
                if (friend.hasOwnProperty(field)) {
                    newItem[field] = friend[field];
                }
            });

            return newItem;
        });
    };

    return { name: 'select', func: slct };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Object}
 */
exports.filterIn = function (property, values) {
    let fltr = (coll) => {
        return coll.filter((friend) => {
            return values.some((prop) => {
                return prop === friend[property];
            });
        });
    };

    return { name: 'filterIn', func: fltr };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Object}
 */
exports.sortBy = function (property, order) {
    let srt = (coll) => {
        coll = coll.sort((fr1, fr2) => fr1[property] > fr2[property]);
        if (order === 'asc') {
            return coll;
        }

        return coll.reverse();
    };

    return { name: 'sortBy', func: srt };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Object}
 */
exports.format = function (property, formatter) {
    let frm = (coll) => {
        return coll.map((friend) => {
            if (property in friend) {
                friend[property] = formatter(friend[property]);
            }

            return friend;
        });
    };

    return { name: 'format', func: frm };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Object}
 */
exports.limit = function (count) {
    let cnt = (coll) => {
        return coll.splice(0, count);
    };

    return { name: 'limit', func: cnt };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object}
     */
    exports.or = function (...funcs) {
        let orFunc = (coll) => {
            funcs = funcs.reduce(function (acc, item) {
                return acc.concat(item.func(coll) || []);
            }, []);

            return funcs.length === 0 ? coll : funcs;
        };

        return { name: 'or', func: orFunc };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object}
     */
    exports.and = function (...funcs) {
        let andFunc = (coll) => {
            funcs.forEach(function (func) {
                coll = func.func(coll);
            });

            return coll;
        };

        return { name: 'and', func: andFunc };
    };
}

