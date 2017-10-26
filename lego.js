'use strict';

const PRECEDENCE = { filterIn: 1, sortBy: 2, select: 3, limit: 4, format: 5 };

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

/**
 * Запрос к коллекции
 * @param {Array} array
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = (array, ...queries) => queries
    .sort((first, second) => PRECEDENCE[first.name] - PRECEDENCE[second.name])
    .reduce((result, selector) => selector(result), array);

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = (...properties) => function select(array) {
    return array.map(value => properties.reduce((newValue, property) => {
        if (value.hasOwnProperty(property)) {
            newValue[property] = value[property];
        }

        return newValue;
    }, {}));
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = (property, values) => function filterIn(array) {
    return array.filter(value => values.includes(value[property]));
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = (property, order) => function sortBy(array) {
    const direct = order === 'asc' ? 1 : -1;

    return array.slice().sort((value1, value2) => {
        if (value1[property] === value2[property]) {
            return 0;
        }

        return value1[property] > value2[property] ? direct : -direct;
    });
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = (property, formatter) => function format(array) {
    return array.map(value => Object.assign(value, { [property]: formatter(value[property]) }));
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = (count) => function limit(array) {
    return array.slice(0, count);
};
