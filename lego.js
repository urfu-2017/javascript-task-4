'use strict';
// Useless comment
exports.isStar = true;

const commands = {
    select: 'select',
    filterIn: 'filterIn',
    sortBy: 'sortBy',
    format: 'format',
    limit: 'limit'
};

const priority = [
    commands.filterIn,
    commands.sortBy,
    commands.select,
    commands.limit,
    commands.format
];

const deepCopy = object => JSON.parse(JSON.stringify(object));

exports.query = function (...collection) {
    let copy = deepCopy(collection[0]);
    let actions = collection.slice(1);
    actions.sort((fi, se) => priority.indexOf(fi.command) - priority.indexOf(se.command));
    actions.forEach(action => {
        if (action.hasOwnProperty('apply')) {
            action.apply(copy);
        } else {
            copy = action.getApplied(copy);
        }
    });

    return copy;
};

exports.select = function (...keys) {
    return {
        command: commands.select,
        apply: records => {
            records.forEach(record => {
                Object.keys(record).forEach(key => {
                    if (keys.indexOf(key) === -1) {
                        delete record[key];
                    }
                });
            });
        }
    };
};

exports.filterIn = function (property, values) {
    const predicate = record => {
        const propertyExists = record.hasOwnProperty(property);
        const propertyValueFits = values.some(val => val === record[property]);

        return propertyExists && propertyValueFits;
    };

    return {
        command: commands.filterIn,
        predicate: predicate,
        getApplied: records => records.filter(predicate)
    };
};

exports.sortBy = function (property, order) {
    return {
        command: commands.sortBy,
        apply: records => records.sort((first, second) => {
            let result;
            if (first[property] < second[property]) {
                result = -1;
            } else if (first[property] > second[property]) {
                result = 1;
            } else {
                result = 0;
            }

            return order === 'asc' ? result : -result;
        })
    };
};


exports.format = function (property, formatter) {
    return {
        command: commands.format,
        apply: records => records.forEach(record => {
            record[property] = formatter(record[property]);
        })
    };
};

exports.limit = function (count) {
    return {
        command: commands.limit,
        getApplied: records => records.slice(0, count)
    };
};

if (exports.isStar) {

    exports.or = function (...filters) {
        const predicate = record => filters.some(filter => filter.predicate(record));

        return {
            commands: commands.filterIn,
            predicate: predicate,
            getApplied: records => records.filter(predicate)
        };
    };

    exports.and = function (...filters) {
        const predicate = record => filters.every(filter => filter.predicate(record));

        return {
            commands: commands.filterIn,
            predicate: predicate,
            getApplied: records => records.filter(predicate)
        };
    };
}
