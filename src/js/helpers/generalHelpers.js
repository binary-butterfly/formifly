import {findFieldValidatorFromName} from './validationHelpers';

export const getFieldValueFromKeyString = (keyString, values) => {
    const fieldNames = keyString.split('.');
    let dependentValue = values;
    for (const fieldName of fieldNames) {
        if (dependentValue[fieldName] === undefined) {
            throw new Error('Could not find value for ' + keyString);
        }
        dependentValue = dependentValue[fieldName];
    }
    return dependentValue;
};

const setDeepValue = (value, fieldNames, currentIndex, oldValue) => {
    let ret = Array.isArray(oldValue) ? [...oldValue] : {...oldValue};
    if (currentIndex === fieldNames.length - 1) {
        ret[fieldNames[currentIndex]] = value;
    } else if (oldValue[fieldNames[currentIndex]] === undefined) {
        ret[fieldNames[currentIndex]] = setDeepValue(value, fieldNames, currentIndex + 1, {});
    } else {
        ret[fieldNames[currentIndex]] = setDeepValue(value, fieldNames, currentIndex + 1, oldValue[fieldNames[currentIndex]]);
    }
    return ret;
};

export const setFieldValueFromKeyString = (keyString, value, oldValues) => {
    const fieldNames = keyString.split('.');

    return setDeepValue(value, fieldNames, 0, oldValues);
};

/**
 * This converts a date object into a string for use as the value of a datetime-local input field.
 * @param {Date} date
 * @return {string}
 */
export const convertDateObjectToInputString = (date) => {
    return date.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).replace(' ', 'T');
};

export const completeDefaultValues = (validatorDefaults, userDefaults, shape, keyText) => {
    Object.entries(userDefaults).map(([key, value]) => {
        const thisKeyText = keyText === undefined ? key : keyText + '.' + key;
        if (value !== null) {
            if (Array.isArray(value)) {
                if (validatorDefaults[key] === undefined || (validatorDefaults[key].length === 0 && value !== [])) {
                    try {
                        const fieldValidator = findFieldValidatorFromName(thisKeyText, shape);
                        validatorDefaults[key] = [fieldValidator.of.getDefaultValue()];
                    } catch (e) {
                        // If the use has supplied some value for an array field that is not defined in the shape, we can safely ignore the shape
                        validatorDefaults[key] = [];
                    }
                }
                validatorDefaults[key] = completeDefaultValues(validatorDefaults[key], value, shape, thisKeyText);
            } else if (typeof value === 'object') {
                if (validatorDefaults[key] === undefined) {
                    validatorDefaults[key] = {};
                }
                validatorDefaults[key] = completeDefaultValues(validatorDefaults[key], value, shape, thisKeyText);
            } else {
                validatorDefaults[key] = value;
            }
        }
    });
    return validatorDefaults;
};

export const containsValuesThatAreNotFalse = (obj) => {
    if (Array.isArray(obj)) {
        return obj.filter((value) => {
            return containsValuesThatAreNotFalse(value) !== false;
        }).length > 0;
    } else if (typeof (obj) === 'object' && obj !== null) {
        return Object.entries(obj).filter((entry) => {
            return containsValuesThatAreNotFalse(entry[1]) !== false;
        }).length > 0;
    }
    return obj !== false;
};
