'use strict';

const ORDER = { filterIn: 1, sortBy: 2, select: 3, limit: 4, format: 5 };

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
exports.query = (array, ...queries) => {
    return queries.sort((first, second) => {
        const orderFirst = ORDER[first.name];
        const orderSecond = ORDER[second.name];

        if (!orderFirst || !orderSecond) {
            throw new TypeError('Syntax error');
        }

        return orderFirst - orderSecond;
    }).reduce((result, query) => query(result), array);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = (...properties) => function select(array) {
    return array.map(value =>
        properties.reduce((result, property) => {
            if (value.hasOwnProperty(property)) {
                result[property] = value[property];
            }

            return result;
        }, {})
    );
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
    const direction = order === 'asc' ? 1 : -1;

    return array.slice().sort((first, second) => {
        return (first[property] > second[property] ? 1 : -1) * direction;
    });
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = (property, formatter) => function format(array) {
    return array.map(value => Object.assign({}, value, { [property]: formatter(value[property]) }));
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = count => function limit(array) {
    return array.slice(0, count);
};
