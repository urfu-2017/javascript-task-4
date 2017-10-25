'use strict';
const functionWeight = {
    format: 1,
    select: 2,
    filterIn: 3,
    sortBy: 4
};

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

exports.query = function (collection, ...values) {
    var clone = Object.assign([], collection);
    const methods = Array.from(values)
        .sort((firstFunction, secondFunction) => {
            if (functionWeight[firstFunction.name] > functionWeight[secondFunction.name]) {
                return -1;
            }
            if (functionWeight[firstFunction.name] < functionWeight[secondFunction.name]) {
                return 1;
            }

            return 0;
        });
    methods.forEach(function (func) {
        clone = func(clone);
    });

    return clone;
};

/**
 * Выбор полей
 * @params {...String}
 */

exports.select = function (...values) {
    return function select(collection) {
        return collection.map(function (data) {
            Object.keys(data).forEach(function (key) {
                if (!values.includes(key)) {
                    delete data[key];
                }
            });

            return data;
        });
    };

};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */

exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(function (data) {
            return values.indexOf(data[property]) !== -1;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */

exports.sortBy = function (property, order) {
    return function SortBy(collection) {
        return collection.sort(function (firstValue, secondValue) {
            if (order === 'asc') {
                let typeAsc = Number(firstValue[property] > secondValue[property]);

                return typeAsc;
            }
            let typeDesc = Number(firstValue[property] < secondValue[property]);

            return typeDesc;
        }
        );
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */

exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (data) {
            if (property in data) {
                data[property] = formatter(data[property]);
            }

            return data;
        }
        );
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */
exports.limit = function (count) {
    console.info(count);

    return;
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
