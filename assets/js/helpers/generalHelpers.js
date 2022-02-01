export const getFieldValueFromKeyString = (keyString, values) => {
    const fieldNames = keyString.split('.');
    let dependentValue = values;
    for (const fieldName of fieldNames) {
        if (!dependentValue[fieldName]) {
            throw new Error('Could not find value for ' + keyString);
        }
        dependentValue = dependentValue[fieldName];
    }
    return dependentValue;
};
