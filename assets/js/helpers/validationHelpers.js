export const findFieldValidatorFromName = (name, shape) => {
    const fieldNames = name.split('.');
    let dependentValue = shape;
    for (const index in fieldNames) {
        const fieldName = fieldNames[index];
        if (dependentValue.of !== undefined) {
            if (!isNaN(fieldName)) {
                dependentValue = dependentValue.of;
            } else {
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
