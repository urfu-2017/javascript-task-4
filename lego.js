'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;


const copy = function copyColl(coll) {
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

    let commonParams = funcs.filter((func) => func.name === 'select')
        .reduce(function (acc, item) {
            return acc.concat(item.params || []);
        }, []);

    funcs.filter(function (func) {
        return 'priority' in func;
    })
        .sort(function (func1, func2) {
            return func1.priority > func2.priority;
        })
        .forEach(function (func) {
            if (func.name === 'select') {
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
        return coll.map(function (man) {
            let copyMan = copy(man);
            for (let prop in man) {
                if (!man.hasOwnProperty(prop)) {
                    continue;
                }
                if (commonFields.indexOf(prop) === -1) {
                    delete man[prop];
                }
            }
            if (Object.keys(man).length === 0) {
                return copyMan;
            }

            return man;
        });
    };

    return { name: 'select', priority: 5, func: slct, params: fields };
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
                if (property in friend) {
                    return prop === friend[property];
                }

                return false;
            });
        });
    };

    return { name: 'filterIn', priority: 3, func: fltr };
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

    return { name: 'sortBy', priority: 4, func: srt };
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

    return { name: 'format', priority: 6, func: frm };
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

    return { name: 'limit', priority: 7, func: cnt };
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

        return { name: 'or', priority: 1, func: orFunc };
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

        return { name: 'and', priority: 2, func: andFunc };
    };
}

