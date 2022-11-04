export const findFieldValidatorFromName = (name, shape) => {
    const fieldNames = name.split('.');
    let dependentValue = shape;
    for (const index in fieldNames) {
        const fieldName = fieldNames[index];
        if (dependentValue.of !== undefined) {
            // This is an array validator
            if (!isNaN(fieldName)) {
                // Since the name is numeric, we work with it directly
                dependentValue = dependentValue.of;
            } else {
                // If the name is non numeric, we check if this may be an array of objects where an object has the given name
                if (dependentValue.of?.fields[fieldName] === undefined) {
                    throw new Error('Could not find validator for ' + name);
                }
                dependentValue = dependentValue.of?.fields[fieldName];
            }
        } else {
            if (dependentValue?.fields[fieldName] === undefined) {
                throw new Error('Could not find validator for ' + name);
            }
            dependentValue = dependentValue?.fields[fieldName];
        }
    }
    return dependentValue;
};

export const findFieldValidatorAndSiblingsFromName = (name: string, shape, values) => {
    const fieldNames = name.split('.');
    let validator = shape;
    let siblings = values;
    let lastSiblings = siblings;

    for (const index in fieldNames) {
        const fieldName = fieldNames[index];
        lastSiblings = siblings;
        siblings = siblings[fieldName];
        if (validator.of !== undefined) {
            validator = validator.of;
        } else {
            if (validator?.fields[fieldName] === undefined) {
                throw new Error('Could not find validator for ' + name);
            }
            validator = validator?.fields[fieldName];
        }
    }
    return [validator, lastSiblings];
};

export const unpackErrors = (currentResult) => {
    let ret = {};
    if (currentResult[0] === false) {
        if (Array.isArray(currentResult[1])) {
            currentResult[1].map((result, index) => {
                if (result[0] === false) {
                    ret[index] = unpackErrors(result);
                }
            });
        } else if (currentResult[1] instanceof Object) {
            Object.entries(currentResult[1]).map(([name, result]) => {
                if (result[0] === false) {
                    ret[name] = unpackErrors(result);
                }
            });
        } else {
            ret = currentResult[1];
        }
    }
    return ret;
};
