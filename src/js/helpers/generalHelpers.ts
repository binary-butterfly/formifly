import {findFieldValidatorFromName} from './validationHelpers';
import ArrayValidator from '../classes/ArrayValidator';
import {ObjectValue, UnpackedErrors, Value, ValueOfValidator} from '../types';
import BaseValidator from '../classes/BaseValidator';

export const getFieldValueFromKeyString = (
    keyString: string|number, values: Value|UnpackedErrors<any>
): Value => {
    const fieldNames = String(keyString).split('.');
    let dependentValue = values;
    for (const fieldName of fieldNames) {
        if ((dependentValue as ObjectValue)[fieldName] === undefined) {
            throw new Error('Could not find value for ' + keyString);
        }
        dependentValue = (dependentValue as ObjectValue)[fieldName];
    }
    return dependentValue;
};

const setDeepValue = <T extends Value>(
    value: Value, fieldNames: string[], currentIndex: number, oldValues: Value
): T => {
    if (typeof oldValues !== 'object' && !Array.isArray(oldValues)) {
        throw new Error('Could not find value for ' + fieldNames.join('.'));
    }

    const ret = Array.isArray(oldValues) ? [...oldValues] : {...oldValues};

    // any casts because we either index a record with a string or an array with a string that is implicitly cast to an int.
    // this is hard to teach ts
    if (currentIndex === fieldNames.length - 1) {
        (ret as any)[fieldNames[currentIndex]] = value;
    } else if ((oldValues as any)[fieldNames[currentIndex]] === undefined) {
        (ret as any)[fieldNames[currentIndex]] = setDeepValue(value, fieldNames, currentIndex + 1, {});
    } else {
        (ret as any)[fieldNames[currentIndex]] = setDeepValue(
            value, fieldNames, currentIndex + 1, (oldValues as any)[fieldNames[currentIndex]]
        );
    }
    return ret as T;
};

export const setFieldValueFromKeyString = <T extends Value>(
    keyString: string, value: Value, oldValues: T
): T => {
    const fieldNames = keyString.split('.');

    return setDeepValue(value, fieldNames, 0, oldValues);
};

/**
 * This converts a date object into a string for use as the value of a datetime-local input field.
 * @param {Date} date
 * @return {string}
 */
export const convertDateObjectToInputString = (date: Date) => {
    return date.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).replace(' ', 'T');
};

// todo: lots of any casts in this, unfortunately. I'm sure we could get away with fewer casts by using better typeguards,
// but as all casts are internally only and the interface is well typed, I don't think this is urgent.
export const completeDefaultValues = <T extends BaseValidator<any>>(
    validatorDefaults: ValueOfValidator<T>,
    userDefaults: Partial<ValueOfValidator<T>>,
    shape?: T,
    keyText?: string
): ValueOfValidator<T> => {
    Object.entries(userDefaults).map(([keyInternal, value]: [string|number, any]) => {
        const key = keyInternal as keyof ValueOfValidator<T>;
        const thisKeyText = keyText === undefined ? String(key) : keyText + '.' + String(key);
        if (value !== null) {
            if (Array.isArray(value)) {
                if (validatorDefaults[key] === undefined || (validatorDefaults[key] as Array<any>).length === 0) {
                    try {
                        // shape should be an ArrayValidator here, but typing doesn't know that (yet)
                        const fieldValidator = findFieldValidatorFromName(thisKeyText, shape) as ArrayValidator<any>;
                        validatorDefaults[key] = [] as any;
                        for (let c = 0; c < value.length; c++) {
                            (validatorDefaults[key] as Array<any>).push(fieldValidator.of.getDefaultValue());
                        }
                    } catch (e) {
                        // If the use has supplied some value for an array field that is not defined in the shape, we can safely ignore the shape
                        validatorDefaults[key] = [] as any;
                    }
                }
                validatorDefaults[key] = completeDefaultValues(validatorDefaults[key] as any, value as any, shape, thisKeyText) as any;
            } else if (typeof value === 'object') {
                if (validatorDefaults[key] === undefined) {
                    validatorDefaults[key] = {} as any;
                }
                validatorDefaults[key] = completeDefaultValues(validatorDefaults[key] as any, value as any, shape, thisKeyText) as any;
            } else {
                validatorDefaults[key] = value;
            }
        }
    });
    return validatorDefaults;
};

export const containsValuesThatAreNotFalse = (obj: any): boolean => {
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

/**
 * Checks if a date Object is invalid
 * @param {Date} date
 * @returns {boolean}
 */
export const isInvalidDate = (date: Date) => {
    return isNaN(Number(date));
};
