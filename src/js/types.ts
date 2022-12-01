import BaseValidator from './classes/BaseValidator';
import ObjectValidator from './classes/ObjectValidator';
import ArrayValidator from './classes/ArrayValidator';


export type SubmitFunction = (_: Value | undefined, __: (___: any) => void) => Promise<void> | void;
export type SubmitValidationErrorFunction<T extends BaseValidator<any>> =
    undefined | ((errors: UnpackedErrors<T>, reason: UnpackedErrors<T>) => void);


export type MutationFunction<T extends Value = any> = (value?: T, values?: Value, siblings?: Value) => T;
export type ValidateFunction<T extends Value> =
    (value: T, values: Value, siblings: Value) => IndividualValidationResult<T>;
export type ErrorFunction = (value: Value | undefined, otherValues: Value) => void;
export type CheckFunction = (valueArray: ArrayValue, value: Value) => boolean;


// In theory, ValidationResult could be typed more specifically. For example, in the third type of the union, the map
// is always based on a known shape. In practise, we iterate over all elements of the map anyway, so designing this type
// so it is known which fields are in the map at compile type seems superfluous.
export type ValidationResult<T extends Value | ErrorType> = |
    [true, T?] |
    [false, string] |
    [false, Record<string, ValidationResult<Value | ErrorType>>] |
    [false, ValidationResult<Value | ErrorType>[]];

export type UnpackedErrors<V extends BaseValidator<any>> =
    V extends ObjectValidator<infer O> ?
        { [K in keyof O]: UnpackedErrors<O[K]> } :
        V extends ArrayValidator<infer A> ?
            UnpackedErrors<A>[] :
            string | false;

export type ErrorType = string | false | { [key: string]: ValidationResult<ErrorType> } | ValidationResult<ErrorType>[];

export type DependentValidationResult<T extends Value> = [false] | [true, ValidationResult<T>];
export type IndividualValidationResult<T extends Value> = {
    success: boolean;
    msgName: string;
    errorMsg?: string;
    translationContext?: {
        [key: string]: string | number,
    };
    changedValue?: T;
}


// todo: discuss if we want to use an object instead, to be able to name the components. That'd be a breaking change tho
export type ValidatorStep = [string, (dependentValue: Value, value?: Value) => boolean, BaseValidator<any>];

export type Dependent = ValidatorStep | Array<Array<ValidatorStep>>


export type InputType =
    'text'
    | 'number'
    | 'radio'
    | 'radio-group'
    | 'checkbox'
    | 'select'
    | 'datetime-local'
    | 'tel'
    | 'email';


export type FlatValue = string | boolean | number | Date;
export type ObjectValue = { [key: string]: Value };
export type ArrayValue = Value[];

export type Value = FlatValue | ObjectValue | ArrayValue;

export type ValueOfValidator<V> = V extends BaseValidator<infer T> ? T : any;
export type ValueOfObjectValidatorFields<T extends ObjectValidatorFields> = { [K in keyof T]: ValueOfValidator<T[K]> };

export type ObjectValidatorFields = { [key: string]: BaseValidator<any> };


export function isValidatorStepArrayArray(dependent?: Dependent): dependent is Array<Array<ValidatorStep>> {
    return !!dependent && Array.isArray(dependent) && Array.isArray(dependent[0]);
}

export function isValidatorStep(dependent?: boolean | ValidatorStep): dependent is ValidatorStep {
    return !!dependent && Array.isArray(dependent) && !Array.isArray(dependent[0]);
}
