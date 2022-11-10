// todo: consider moving types to a separate types file
import BaseValidator from './classes/BaseValidator';


export type SubmitFunction = (_: ValueType | undefined, __: (___: any) => void) => Promise<void> | void;
export type SubmitValidationErrorFunction = undefined | ((errors: ValueType, reason: UnpackedErrors) => void);


export type MutationFunction<T extends ValueType> = (value?: T, values?: ValueType, siblings?: ValueType) => T;
export type ValidateFunction<T extends ValueType> =
    (value: T | undefined, values: ValueType, siblings: ValueType) => IndividualValidationResult<T>;
export type ErrorFunction = (value: ValueType | undefined, otherValues: ValueType) => void;
export type CheckFunction<T extends ValueType> = (_: Array<T>, __?: T) => boolean;


export type ValidationResult<T extends ValueType | ErrorType> = |
    [true, T?] |
    [false, string] |
    [false, Record<string, ValidationResult<ValueType | ErrorType>>] |
    [false, ValidationResult<ValueType | ErrorType>[]];


export type UnpackedErrors = string | false | { [key: string]: UnpackedErrors } | UnpackedErrors[];
export type ErrorType = string | false | { [key: string]: ValidationResult<ErrorType> } | ValidationResult<ErrorType>[];

export type DependentValidationResult<T extends ValueType> = [false] | [true, ValidationResult<T>];
export type IndividualValidationResult<T extends ValueType> = {
    success: boolean;
    errorMsg: string;
    changedValue?: T;
}


// todo: discuss if we want to use an object instead, to be able to name the components. That'd be a breaking change tho
export type ValidatorStep = [string, (dependentValue: ValueType, value?: ValueType) => boolean, BaseValidator<any>];

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


type ValueTypeInternal = string | boolean | number | Date;
export type ObjectValue = { [key: string]: ValueType };
export type ArrayValue = ValueType[];

export type ValueType = ValueTypeInternal | ObjectValue | ArrayValue;


export function isValidatorStepArrayArray(dependent: Dependent): dependent is Array<Array<ValidatorStep>> {
    return Array.isArray(dependent) && Array.isArray(dependent[0]);
}

export function isValidatorStep(dependent: boolean | ValidatorStep): dependent is ValidatorStep {
    return Array.isArray(dependent);
}
