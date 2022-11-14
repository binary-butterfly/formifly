import BaseValidator from '../classes/BaseValidator';
import ArrayValidator from '../classes/ArrayValidator';
import ObjectValidator from '../classes/ObjectValidator';
import {UnpackedErrors, ValidationResult, Value, ValueOfValidator} from '../types';


export const findFieldValidatorFromName = (
    name: string, shape?: ObjectValidator<any> | ArrayValidator<any> | BaseValidator<any>
): ObjectValidator<any> | ArrayValidator<any> | BaseValidator<any> | undefined => {
    const fieldNames = name.split('.');
    let dependentValue = shape;
    for (const index in fieldNames) {
        const fieldName = fieldNames[index];
        if (dependentValue && 'of' in dependentValue) {
            // This is an array validator
            if (!isNaN(Number(fieldName))) {
                // Since the name is numeric, we work with it directly
                dependentValue = dependentValue.of;
            } else {
                const of = dependentValue.of as BaseValidator<any> | ObjectValidator<any>;
                // If the name is non numeric, we check if this may be an array of objects where an object has the given name
                if (!('fields' in of) || of.fields[fieldName] === undefined) {
                    throw new Error('Could not find validator for ' + name);
                }
                dependentValue = of.fields[fieldName];
            }
        } else {
            if (!dependentValue || !('fields' in dependentValue) || dependentValue.fields[fieldName] === undefined) {
                throw new Error('Could not find validator for ' + name);
            }
            dependentValue = dependentValue.fields[fieldName];
        }
    }
    return dependentValue;
};

export const findFieldValidatorAndSiblingsFromName = <T extends BaseValidator<any>|ArrayValidator<any>|ObjectValidator<any>>(
    name: string,
    shape: T,
    values: ValueOfValidator<T>
): [T, Value] => {
    const fieldNames = name.split('.');
    let validator = shape;

    let siblings = values;
    let lastSiblings = siblings;

    for (const index in fieldNames) {
        const fieldName = fieldNames[index];
        lastSiblings = siblings;
        siblings = siblings[fieldName];
        if ('of' in validator && validator.of !== undefined) {
            validator = validator.of;
        } else {
            if (!('fields' in validator) || validator.fields[fieldName] === undefined) {
                throw new Error('Could not find validator for ' + name);
            }
            validator = validator.fields[fieldName];
        }
    }
    return [validator, lastSiblings];
};

export const unpackErrors = <T extends BaseValidator<any>>(currentResult: ValidationResult<ValueOfValidator<T>>): UnpackedErrors<T>|{} => {
    let ret: any = {};
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
