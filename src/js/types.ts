import BaseValidator from './classes/BaseValidator';


export type SubmitFunction = (_: Value | undefined, __: (___: any) => void) => Promise<void> | void;
export type SubmitValidationErrorFunction<T extends Value> = undefined | ((errors: T, reason: UnpackedErrors<T>) => void);


export type MutationFunction<T extends Value = any> = (value?: T, values?: Value, siblings?: Value) => T;
export type ValidateFunction<T extends Value> =
    (value: T | undefined, values: Value, siblings: Value) => IndividualValidationResult<T>;
export type ErrorFunction = (value: Value | undefined, otherValues: Value) => void;
export type CheckFunction<T extends Value> = (_: Array<T>, __?: T) => boolean;


export type ValidationResult<T extends Value | ErrorType> = |
    [true, T?] |
    [false, string] |
    [false, Record<string, ValidationResult<Value | ErrorType>>] |
    [false, ValidationResult<Value | ErrorType>[]];

// todo: needs to be reworked due to the dreaded 'excessively deep' error
export type UnpackedErrors<T extends Value> =
    T extends ObjectValue ?
        {[K in keyof T]: UnpackedErrors<T[K]>} :
        T extends ArrayValue ?
            {[K in keyof T]: K extends number ? UnpackedErrors<T[0]> : never} :
            string | false

//export type UnpackedErrors = string | false | { [key: string]: UnpackedErrors } | UnpackedErrors[];
export type ErrorType = string | false | { [key: string]: ValidationResult<ErrorType> } | ValidationResult<ErrorType>[];

export type DependentValidationResult<T extends Value> = [false] | [true, ValidationResult<T>];
export type IndividualValidationResult<T extends Value> = {
    success: boolean;
    errorMsg: string;
    changedValue?: T;
}


// todo: discuss if we want to use an object instead, to be able to name the components. That'd be a breaking change tho
export type ValidatorStep = [string, (dependentValue: Value, value?: Value) => boolean, BaseValidator<any>];

export type Dependent = boolean | ValidatorStep | Array<Array<ValidatorStep>>


// todo: there is a link between input types and ValueTypes, would be great to have it explicitly modeled
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
export type ValueOfObjectValidatorFields<T extends ObjectValidatorFields> = {[K in keyof T]: ValueOfValidator<T[K]>};

export type ObjectValidatorFields = {[key: string]: BaseValidator<any>};


export function isValidatorStepArrayArray(dependent: Dependent): dependent is Array<Array<ValidatorStep>> {
    return Array.isArray(dependent) && Array.isArray(dependent[0]);
}

export function isValidatorStep(dependent: boolean | ValidatorStep): dependent is ValidatorStep {
    return Array.isArray(dependent);
}
