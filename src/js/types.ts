import type BaseValidator from './classes/BaseValidator';
import type ObjectValidator from './classes/ObjectValidator';
import type ArrayValidator from './classes/ArrayValidator';

export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

export type SubmitFunction<Validator extends BaseValidator<any>> = (
    // todo: ideally only non-required values should be allowed to be undefined, but as that's harder to type,
    //  this is good enough for now
    values: DeepPartial<ValueOfValidator<Validator>> | undefined,
    setErrors: (errors: UnpackedErrors<Validator>) => void
) => Promise<void> | void;

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

/**
 * The ValidatorShapeType is a generic type, that copies the shape of Validator V and allows for values of type T in
 * the leaf nodes of the shape.
 */
export type ValidatorShapeType<V extends BaseValidator<any>, T extends any> =
    V extends ObjectValidator<infer O> ?
        { [K in keyof O]: ValidatorShapeType<O[K], T> } :
        V extends ArrayValidator<infer A> ?
            ValidatorShapeType<A, T>[] :
            T;

export type UnpackedErrors<V extends BaseValidator<any>> = DeepPartial<ValidatorShapeType<V, string | false>>;
export type TouchedValues<V extends BaseValidator<any>> = ValidatorShapeType<V, boolean>;

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
    | 'email'
    | 'date';


export type FlatValue = string | boolean | number | Date;
export type ObjectValue = { [key: string]: Value };
export type ArrayValue = Value[];

export type Value = FlatValue | ObjectValue | ArrayValue;

export type ValueOfValidator<V extends BaseValidator<any>> = V['defaultValue'];
export type ValueOfObjectValidatorFields<T extends ObjectValidatorFields> = { [K in keyof T]: ValueOfValidator<T[K]> };

export type ObjectValidatorFields = { [key: string]: BaseValidator<any> };


export function isValidatorStepArrayArray(dependent?: Dependent): dependent is Array<Array<ValidatorStep>> {
    return !!dependent && Array.isArray(dependent) && Array.isArray(dependent[0]);
}

export function isValidatorStep(dependent?: boolean | ValidatorStep): dependent is ValidatorStep {
    return !!dependent && Array.isArray(dependent) && !Array.isArray(dependent[0]);
}


type ResultType<S extends string|number, V extends Value> =
    S extends number
        ? V extends Array<infer A>
            ? A
            : undefined
        : S extends `${infer First}.${infer Rest}`
            ? V extends Record<any, any>
                ? ResultType<Rest, V[First]>
                : never
            : S extends `${infer Last}`
                ? V extends Record<any, any>
                    ? V[Last]
                    : undefined
                : never;

const getFieldValueFromKeyString = <S extends string|number, T extends Value>(
    keyString: S, values: T,
): ResultType<S, T> => {
    const fieldNames = String(keyString).split('.');
    let dependentValue = values;
    for (const fieldName of fieldNames) {
        if ((dependentValue as ObjectValue)[fieldName] === undefined) {
            throw new Error('Could not find value for ' + keyString);
        }
        dependentValue = (dependentValue as any)[fieldName];
    }
    return dependentValue as ResultType<S, T>;
};


// todo: the calls that result in an "unknown" type should ideally result in "undefined" instead
// todo: need to test if the calls resulting in undefined actually return undefined; if they error, type them never
const t = getFieldValueFromKeyString('test.1.str', {test: [{str: 'yay!'}]}); // string
const t2 = getFieldValueFromKeyString(0, ['3', '2']); // string
const t3 = getFieldValueFromKeyString('0', ['3', '2']); // string
const t4 = getFieldValueFromKeyString('test.1', {test: [{str: 'yay!'}]}); // {str: string}

const b = getFieldValueFromKeyString('test.1.str.5', {test: [{str: 'yay!'}]}); // undefined
const b2 = getFieldValueFromKeyString('test.1.strrrrrr', {test: [{str: 'yay!'}]}); // unknown :(
const b3 = getFieldValueFromKeyString('test.1.str.sss', {test: [{str: 'yay!'}]}); // undefined
const b5 = getFieldValueFromKeyString('02', ['3', '2']); // unknown :(
const b6 = getFieldValueFromKeyString(1, {test: [{str: 'yay!'}]}); // undefined
