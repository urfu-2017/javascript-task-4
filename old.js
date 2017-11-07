'use strict';
var QUERY_TYPES = {
    SELECT: 3,
    FILTER: 1,
    SORT: 2,
    LIMIT: 99,
    FORMAT: 99
};
var SORT_DIRECTION = {
    ASCENDING: 'asc',
    DESCENDING: 'desc'
};

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

function cloneCollection(collection) {
    return collection.reduce(function (previous, current) {
        current = [cloneObject(current)];

        return previous.concat(current);
    }, []);
}
function cloneObject(obj) {
    return Object.assign({}, obj);
}
function getIntersection(listOfArrays) {
    if (!listOfArrays.length) {
        return [];
    }
    var firstArray = listOfArrays[0];
    var anyOtherArrayContains = function (item) {
        var otherArrays = listOfArrays.splice(1);
        if (!otherArrays.length) {
            return true;
        }

        return otherArrays.some(function (otherArray) {
            return otherArray.indexOf(item) !== -1;
        });
    };

    return firstArray.filter(anyOtherArrayContains);
}
function getUnion(listOfArrays) {
    if (!listOfArrays.length) {
        return [];
    }
    var union = listOfArrays[0];
    listOfArrays.splice(1).forEach(function (arrayItem) {
        union.concat(arrayItem.filter(function (item) {
            if (union.indexOf(item) === -1) {
                return true;
            }

            return false;
        }));
    });

    return union;
}
function applyFiltersToCollection(filters, collection) {
    var filteredCollections = [];
    if (filters.length === 0) {
        return [cloneCollection(collection)];
    }
    filters.forEach(function (filterQuery) {
        var filtered = filterQuery.query(collection);
        filteredCollections.push(filtered);
    });

    return filteredCollections;
}
function getExistingSelectArguments(collection, queryArguments) {
    var compatibleArguments = [];
    queryArguments.forEach(function (argument) {
        var allCollectionItemsHaveProperty = true;
        collection.forEach(function (item) {
            if (!item.hasOwnProperty(argument)) {
                allCollectionItemsHaveProperty = false;
            }
        });
        if (allCollectionItemsHaveProperty) {
            compatibleArguments.push(argument);
        }
    });

    return compatibleArguments;
}
function orderByDefault(defaultCollection, unorderedCollection) {
    var orderedCollection = [];
    unorderedCollection = unorderedCollection.map(function (item) {
        var idx = defaultCollection.indexOf(item);
        var clonedObject = cloneObject(item);
        clonedObject.idx = idx;
        var objectWithIdx = clonedObject;


        return objectWithIdx;
    });
    orderedCollection = unorderedCollection.sort(function (a, b) {
        return a.position - b.position;
    }).map(function (item) {
        delete item.position;

        return item;
    });

    return orderedCollection;
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {Object} - query-object
 */
var select = function () {
    var args = [].slice.call(arguments, 0);

    return {
        queryType: QUERY_TYPES.SELECT,
        queryArguments: args,
        query: function (collection) {
            return collection.map(function (item) {
                var selectedItem = {};
                args.forEach(function (property) {
                    if (item.hasOwnProperty(property)) {
                        selectedItem[property] = item[property];
                    }
                });

                return selectedItem;
            });
        }
    };

};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var collectionCopy = cloneCollection(collection);
    var args = [].slice.call(arguments, 1);
    var selectArguments = [];
    var nonSelectArgs = [];
    args.forEach(function (queryFunction) {
        if (queryFunction.queryType === QUERY_TYPES.SELECT) {
            var compatibleArguments = getExistingSelectArguments(
                collection, queryFunction.queryArguments);
            if (compatibleArguments.length > 0) {
                selectArguments.push(compatibleArguments);
            }
        } else {
            nonSelectArgs.push(queryFunction);
        }
    });
    args = nonSelectArgs;
    if (selectArguments.length > 0) {
        var selectArgumentsIntersection = getIntersection(selectArguments);
        args.push(select.apply(this, selectArgumentsIntersection));
    }
    args.sort(function (a, b) {
        return a.queryType - b.queryType;
    });
    args.forEach(function (queryFunction) {
        collectionCopy = queryFunction.query(collectionCopy);
    });

    return collectionCopy;
};
exports.select = select;

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Object} - query-object
 */
exports.filterIn = function (property, values) {
    console.info(property, values);

    return {
        queryType: QUERY_TYPES.FILTER,
        query: function (collection) {
            return collection.filter(function (item) {
                if (values.length !== 0 && item.hasOwnProperty(property) &&
                    values.indexOf(item[property]) !== -1) {
                    return true;
                }

                return false;
            });
        }
    };
};


/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Object} - query-object
 */
exports.sortBy = function (property, order) {
    console.info(property, order);

    return {
        queryType: QUERY_TYPES.SORT,
        query: function (collection) {
            var newCollection = cloneCollection(collection);
            var orderMultiplyer = order === SORT_DIRECTION.DESCENDING ? -1 : 1;

            return newCollection.sort(function (a, b) {
                return orderMultiplyer * (String(a[property])).localeCompare(String(b[property]));
            });
        }
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Object} - query-object
 */
exports.format = function (property, formatter) {
    console.info(property, formatter);

    return {
        queryType: QUERY_TYPES.FORMAT,
        query: function (collection) {
            return collection.map (function (item) {
                if (item.hasOwnProperty(property)) {
                    item[property] = formatter(item[property]);
                }

                return item;
            });
        }
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Object} - query-object
 */
exports.limit = function (count) {
    console.info(count);

    return {
        queryType: QUERY_TYPES.LIMIT,
        query: function (collection) {
            return collection.slice(0, count);
        }
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object} - query-object
     */
    exports.or = function () {
        var filters = [].slice.call(arguments, 0);

        return {
            queryType: QUERY_TYPES.FILTER,
            query: function (collection) {
                var filteredCollections = applyFiltersToCollection(filters, collection);
                var united = getUnion(filteredCollections);
                united = orderByDefault(collection, united);

                return united;
            }
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Object} - query-object
     */
    exports.and = function () {
        var filters = [].slice.call(arguments, 0);

        return {
            queryType: QUERY_TYPES.FILTER,
            query: function (collection) {
                var filteredCollections = applyFiltersToCollection(filters, collection);
                var intersection = getIntersection(filteredCollections);
                intersection = orderByDefault(collection, intersection);

                return intersection;
            }
        };
    };
}
