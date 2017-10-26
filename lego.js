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

function copyCollectoin(collection) {
    return collection.map((element) => Object.assign({}, element));
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} queries – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection, ...queries) {
    var workingCollection = copyCollectoin(collection);
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
        let workingCollection = copyCollectoin(collection);

        return workingCollection.map(record => {

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
        let workingCollection = copyCollectoin(collection);
        console.info(property, values);
        workingCollection = workingCollection.filter(x => {
            for (var value of values) {
                if (x[property].indexOf(value) !== -1) {
                    return true;
                }
            }

            return false;
        });

        return workingCollection;
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Array} возвращает отсортированнаую в порядке order по полю property коллекцию
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        let workingCollection = copyCollectoin(collection);
        console.info(property, order);
        if (order === 'asc') {
            workingCollection.sort((a, b) => a[property] > b[property]);
        } else {
            workingCollection.sort((a, b) => a[property] < b[property]);
        }

        return workingCollection;
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
        let workingCollection = copyCollectoin(collection);
        console.info(property, formatter);
        for (var record of workingCollection) {
            record[property] = formatter(record[property]);
        }

        return workingCollection;
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Array} - возвращает урезанную коллекцию (первые count элементов)
 */
exports.limit = function (count) {
    return function limit(collection) {
        let workingCollection = copyCollectoin(collection);
        console.info(count);
        workingCollection = workingCollection.slice(0, count);

        return workingCollection;
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
