/* eslint-disable valid-jsdoc,linebreak-style */
'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

let EXPR_ORDER = ['and', 'or', 'filterIn', 'sortBy', 'select', 'format', 'limit'];

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @param q
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...q) {
    let potatoCollection = collection.map(friend => {
        return Object.assign({}, friend);
    });
    q.sort((a, b) => {
        return EXPR_ORDER.indexOf(a.name) - EXPR_ORDER.indexOf(b.name);
    });
    for (let f of q) {
        potatoCollection = f(potatoCollection);
    }

    return potatoCollection;
};


/**
 * Выбор полей
 * @params {...String}
 */
exports.select = function (...q) {
    return function select(collection) {
        return collection.map(el => {
            let newObjOfFriends = {};
            for (let field of q) {
                if (el[field] !== undefined) {
                    newObjOfFriends[field] = el[field];
                }
            }

            return newObjOfFriends;
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */
exports.filterIn = function (property, values) {
    console.info(property, values);

    return collection => {
        let potatoColection = [];
        for (let i = 0; i < collection.length; i++) {
            if (values.indexOf(collection[i][property]) !== -1) {
                potatoColection.push(collection[i]);
            }
        }

        return potatoColection;
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */
exports.sortBy = function (property, order) {
    console.info(property, order);

    return collection => {
        let potatoCollection = collection;
        let funcSort = (property === 'age')
            ? (a, b) => {
                if (a > b) {
                    return 1;
                }
                if (a < b) {
                    return -1;
                }

                return 0;
            }
            : (a, b) => a.localeCompare(b);
        potatoCollection.sort((a, b) => {
            return funcSort(a[property], b[property]);
        });

        return order === 'desc' ? potatoCollection.reverse() : potatoCollection;

    };

};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */
exports.format = function (property, formatter) {
    console.info(property, formatter);

    return collection => {
        let potatoCollection = [];
        for (let i = 0; i < collection.length; i++) {
            potatoCollection.push(collection[i]);
            potatoCollection[i][property] = formatter(collection[i][property]);
        }

        return potatoCollection;
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */
exports.limit = (count) =>
    collection => {
        return collection.slice(0, count);
    };

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.or = (...q) =>
        collection => {
            return collection.filter(item =>
                q.some(func => {
                    return func([item]).length > 0;
                }));
        };


    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = (...q) =>
        collection => {
            return collection.filter(item => {
                return q.every(func => {
                    return func([item]).length > 0;
                });
            });
        };

}
