import BaseValidator, {ValidationResult, ValueType} from '../classes/BaseValidator';
import ArrayValidator from '../classes/ArrayValidator';
import ObjectValidator from '../classes/ObjectValidator';


export const findFieldValidatorFromName = (
    name: string, shape?: ObjectValidator | ArrayValidator<any> | BaseValidator<any>
): ObjectValidator | ArrayValidator<any> | BaseValidator<any> | undefined => {
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
                const of = dependentValue.of as BaseValidator<any> | ObjectValidator;
                // If the name is non numeric, we check if this may be an array of objects where an object has the given name
                if (!('fields' in of ) || of.fields[fieldName] === undefined) {
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

export const findFieldValidatorAndSiblingsFromName = (
    name: string,
    shape: BaseValidator<any> | ArrayValidator<any> | ObjectValidator,
    values: ValueType
): [BaseValidator<any>, ValueType] => {
    const fieldNames = name.split('.');
    let validator = shape;

    // todo: any, because in theory this needs to be explicitly type checked to make sure values and shape match
    let siblings: any = values;
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

export type UnpackedErrors = string | false | {[key: string]: UnpackedErrors} | UnpackedErrors[];

export const unpackErrors = (currentResult: ValidationResult<any>): UnpackedErrors => {
    let ret: UnpackedErrors = {};
    if (currentResult[0] === false) {
        if (Array.isArray(currentResult[1])) {
            currentResult[1].map((result, index) => {
                if (result[0] === false) {
                    (ret as UnpackedErrors[])[index] = unpackErrors(result);
                }
            });
        } else if (currentResult[1] instanceof Object) {
            Object.entries(currentResult[1]).map(([name, result]) => {
                if (result[0] === false) {
                    (ret as {[key: string]: UnpackedErrors})[name] = unpackErrors(result);
                }
            });
        } else {
            ret = currentResult[1];
        }
    }
    return ret;
};
