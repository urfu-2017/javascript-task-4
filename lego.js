'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Array} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...funcs) {
    let localCollection = JSON.parse(JSON.stringify(collection));

    let commonParams = funcs.filter((func) => func.name === 'select')
        .reduce(function (acc, item) {
            return acc.concat(item.params || []);
        }, []);

    funcs.filter(function (func) {
        return func.hasOwnProperty('priority');
    })
        .sort(function (func1, func2) {
            return func1.priority - func2.priority;
        })
        .forEach(function (func) {
            if (func.name === 'select' && commonParams.length !== 0) {
                localCollection = func.func(localCollection, commonParams);
            } else {
                localCollection = func.func(localCollection);
            }
        });

    return localCollection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Object}
 */
exports.select = function select(...fields) {
    let slct = (coll, commonFields) => {
        if (commonFields === undefined) {
            return coll;
        }

        return coll.map(function (item) {
            let newItem = {};
            commonFields.forEach((field) => {
                if (item.hasOwnProperty(field)) {
                    newItem[field] = item[field];
                }
            });

            return newItem;
        });
    };

    return { name: 'select', priority: 4, func: slct, params: fields };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Object}
 */
exports.filterIn = function (property, values) {
    let fltr = (coll) => {
        if (values === undefined) {
            return coll;
        }

        return coll.filter((friend) => {
            return values.some((prop) => {
                if (friend.hasOwnProperty(property)) {
                    return prop === friend[property];
                }

                return false;
            });
        });
    };

    return { name: 'filterIn', priority: 1, func: fltr };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Object}
 */
exports.sortBy = function (property, order) {
    let srt = (coll) => {
        let sorted = coll.sort((fr1, fr2) => {
            return fr1[property] - fr2[property];
        });
        if (order === 'asc') {
            return sorted;
        }
        if (order === 'desc') {
            return sorted.reverse();
        }

        return coll;
    };

    return { name: 'sortBy', priority: 2, func: srt };
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
            if (friend.hasOwnProperty(property)) {
                let value = friend[property];
                friend[property] = formatter(value);
            }

            return friend;
        });
    };

    return { name: 'format', priority: 5, func: frm };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Object}
 */
exports.limit = function (count) {
    let cnt = (coll) => {
        if (coll.length > count) {
            return coll.splice(0, count);
        }

        return coll;
    };

    return { name: 'limit', priority: 6, func: cnt };
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
            let resColl = [];
            funcs.forEach(function (func) {
                let copyColl = JSON.parse(JSON.stringify(coll));
                copyColl = func.func(copyColl);
                resColl.push(copyColl);
            });

            return resColl.reduce(function (acc, item) {
                return acc.concat(item || []);
            }, []);
        };

        return { priority: 3, func: orFunc };
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

        return { func: andFunc };
    };
}
