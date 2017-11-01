'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;
var priority = {
    'filterIn': 1,
    'sortBy': 2,
    'select': 3,
    'limit': 4,
    'format': 5
};

function copyCollection(collection) {
    return collection.map((element) => Object.assign({}, element));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} queries – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...queries) {
    var workingCollection = copyCollection(collection);
    var orderedQueries = queries.sort((query1, query2) =>
        priority[query1.name] - priority[query2.name]);
    for (var query of orderedQueries) {
        workingCollection = query(workingCollection);
    }

    return workingCollection;
};

/**
 * Выбор полей
 * @params {...String} fields - поля, по которым проходит выборка
 * @returns {Array} - возвращает коллекцию состоящую только из интересующих полей
 */
exports.select = function (...fields) {
    return function select(collection) {

        return collection.map(record => {

            return processOneRecord(record, fields);
        });
    };
};

function findFieldByTemplate(template, properties) {
    for (var prop of properties) {
        if (prop.indexOf(template) !== -1) {
            return prop;
        }
    }

    return '';
}

function processOneRecord(record, templates) {
    var newRecord = {};
    for (var t of templates) {
        var sutableField = findFieldByTemplate(t, Object.keys(record));
        if (sutableField !== '') {
            newRecord[sutableField] = record[sutableField];
        }
    }

    return newRecord;
}

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Array} - возвращает отфильтрованную коллекцию
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        collection = collection.filter(x => {
            return values.some(t => x[property].indexOf(t) !== -1);
        });

        return collection;
    };
};

function comparator(a, b) {
    if (a < b) {
        return -1;
    }
    if (a === b) {
        return 0;
    }

    return 1;
}

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Array} возвращает отсортированнаую в порядке order по полю property коллекцию
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        if (order === 'asc') {
            collection.sort((a, b) => comparator(a[property], b[property]));
        } else {
            collection.sort((a, b) => comparator(b[property], a[property]));
        }

        return collection;
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Array} - возвращает коллекцию с отформатированным содержимым поля propery
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        for (var record of collection) {
            record[property] = formatter(record[property]);
        }

        return collection;
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Array} - возвращает урезанную коллекцию (первые count элементов)
 */
exports.limit = function (count) {
    return function limit(collection) {
        collection = collection.slice(0, count);

        return collection;
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
