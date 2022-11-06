import PropTypes from 'prop-types';
import {getFieldValueFromKeyString} from '../helpers/generalHelpers';

// todo: consider moving types to a separate types file
export type MutationFunction = (value: ValueType, values?: ShapeValues, siblings?: ShapeValues) => ValueType;
export type ValidateFunction = (value: ValueType, values: ShapeValues, siblings: ShapeValues) => boolean | string | Date | number;
export type ErrorFunction = (value: ValueType, otherValues: ShapeValues) => void;
export type CheckFunction = (_: Array<ValueType>, __: ValueType) => boolean;


export type InputType = 'text' | 'number' | 'radio' | 'radio-group' | 'checkbox' | 'select' | 'datetime-local' | 'tel' | 'email';
// todo: kinda unhappy with this type, check if it can be simplified
export type Dependent = boolean | ValidatorStep | Array<Array<ValidatorStep>>
// @ts-expect-error recursive type
export type ValueType = string | boolean | number | Array<ValueType> | Record<string, ValueType>;

export type ShapeValues = ValueType | Record<string, ValueType>;


export type ValidationResult = |
    [true, ValueType] |
    [true, ValueType[]] |
    [false, string] |
    [false, Record<string, ValidationResult>] |
    [false, ValidationResult[]];

export type DependentValidationResult = [false] | [true, ValidationResult];

// @ts-expect-error recursive type
export type PropType = PropTypes.Validator<any> | Record<string, PropType>;

// todo: consider making this an object. That'd be a breaking change tho...
export type ValidatorStep = [string, (dependentValue: ValueType, value: ValueType) => boolean, BaseValidator];


export function isValidatorStepArrayArray(dependent: Dependent): dependent is Array<Array<ValidatorStep>> {
    return Array.isArray(dependent) && Array.isArray(dependent[0]);
}

export function isValidatorStep(dependent: boolean | ValidatorStep): dependent is ValidatorStep {
    return Array.isArray(dependent);
}

/**
 * The validator that all validators extend.
 * Probably should not be used on its own
 */
class BaseValidator {
    protected defaultInputType: InputType = 'text';
    private requiredError?: string;
    protected validateFuncs: Array<[ValidateFunction, string]> = [];
    protected isRequired: boolean = false;
    protected defaultErrorMsg: string;
    private dependent: Dependent;
    // todo: can we remove this any? if so, update setter and constructor, too
    private defaultValue: ValueType;
    protected propType: PropTypes.Requireable<any> = PropTypes.any;
    protected onError?: ErrorFunction;
    protected mutationFunc?: MutationFunction;

    /**
     * @param [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array|Boolean} [dependent]
     */
    constructor(defaultValue: ValueType = '',
                defaultErrorMsg?: string,
                mutationFunc?: MutationFunction,
                onError?: ErrorFunction,
                dependent: Dependent = false) {
        this.defaultErrorMsg = defaultErrorMsg ?? 'There is an error within this field';
        this.mutationFunc = mutationFunc;
        this.onError = onError;
        this.dependent = dependent;
        this.defaultValue = defaultValue;
    }

    /**
     * Sets the input type that will be passed to fields that this validator validates
     * @param {InputType} newDefaultInputType
     */
    public setDefaultInputType(newDefaultInputType: InputType): void {
        this.defaultInputType = newDefaultInputType;
    }

    /**
     * Sets the default value for this validator
     * @param {any} newDefaultValue
     */
    public setDefaultValue(newDefaultValue: ValueType): void {
        this.defaultValue = newDefaultValue;
    }

    /**
     * Sets the default error message for this validator
     * @param {String} newDefaultErrorMsg
     */
    public setDefaultErrorMsg(newDefaultErrorMsg: string): void {
        this.defaultErrorMsg = newDefaultErrorMsg;
    }

    /**
     * Set the validators mutation function
     * @param {MutationFunction} newMutationFunc
     */
    public setMutationFunc(newMutationFunc: MutationFunction): void {
        this.mutationFunc = newMutationFunc;
    }

    /**
     * Set the validators onError handler
     * @param {Error} newOnError
     */
    public setOnError(newOnError: ErrorFunction): void {
        this.onError = newOnError;
    }

    /**
     * Set the validators dependent field
     * @param {Array|boolean} newDependent
     */
    public setDependent(newDependent: Dependent): void {
        this.dependent = newDependent;
    }

    protected validateRequired(value: ValueType): boolean {
        return (value !== '' && value !== null && value !== undefined && (!(value instanceof Array) || value.length > 0));
    }

    /**
     * Enforces a value to be set
     * @param [msg] - The error message that is displayed when the value is invalid
     * @return {this}
     */
    public required(msg: string = 'This field is required'): this {
        this.isRequired = true;
        this.requiredError = msg;
        return this;
    }

    /**
     * Makes the validation fail in all cases.
     * This may be useful for dependent validators.
     * @param [msg] - The error message that is displayed
     * @return {this}
     */
    public alwaysFalse(msg: string = 'This validator will never return true'): this {
        this.validateFuncs.push([() => false, msg]);
        return this;
    }

    private validateDependentStep(
        step: ValidatorStep | boolean, value: ValueType, otherValues, siblings
    ): DependentValidationResult {
        const dependentValue = getFieldValueFromKeyString(step[0], otherValues);
        if (isValidatorStep(step) && step[1](dependentValue, value)) {
            return [true, step[2].validate(value, otherValues, siblings)];
        } else {
            return [false];
        }
    }

    private validateDependent(value: ValueType, otherValues, siblings): ValidationResult {
        if (isValidatorStepArrayArray(this.dependent)) {
            for (const step of this.dependent[0]) {
                const validated = this.validateDependentStep(step, value, otherValues, siblings);
                if (validated[0]) {
                    return (validated[1]);
                }
            }
        } else {
            const validated = this.validateDependentStep(this.dependent, value, otherValues, siblings);
            if (validated[0]) {
                return validated[1];
            }
        }

        return this.validateIndependent(value, otherValues, siblings);
    }

    private validateIndependent(value: ValueType, otherValues, siblings): ValidationResult {
        if (!this.validateRequired(value)) {
            if (this.isRequired) {
                return [false, this.requiredError ?? this.defaultErrorMsg];
            }
        } else {
            for (const entry of this.validateFuncs) {
                const func = entry[0];
                const test = func(value, otherValues, siblings);
                if (test === false) {
                    return [false, entry[1]];
                } else if (test !== true) {
                    // Allows validators to modify the value
                    value = test;
                }
            }
        }

        return [true, value];
    }

    /**
     * Check if the fields value is greater than another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public greaterThan(name: string, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be greater than the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return value > otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public lessThan(name: string, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be less than the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return value < otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is greater than or equal to another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public greaterOrEqualTo(name: string, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be greater than or equal to the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return value >= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than or equal to another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public lessOrEqualTo(name: string, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be less than or equal to the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return value <= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is greater than the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public greaterThanSibling(key: string | number, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be greater than the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return value > otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public lessThanSibling(key: string | number, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be less than the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return value < otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is greater or equal to the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public greaterOrEqualToSibling(key: string | number, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be greater than or equal to the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return value >= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than or equal to the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public lessOrEqualToSibling(key: string | number, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be less than or equal to the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return value <= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Checks if the field's value is included within the values of an array field
     * @param {String} key
     * @param {function} [checkFn]
     * @param {String} [msg]
     * @return {this}
     */
    public oneOfArrayFieldValues(key: string, checkFn?: CheckFunction, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value is not allowed.';
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                if (!checkFn) {
                    checkFn = (compare, value) => compare.includes(value);
                }

                const compare = getFieldValueFromKeyString(key, otherValues);
                if (Array.isArray(compare)) {
                    return checkFn(compare, value);
                } else {
                    console.warn('Attempted to use oneOfArrayFieldValues validator on a non array field. This is not possible.');
                    return false;
                }
            },
            msg,
        ]);

        return this;
    }

    /**
     * Checks if the field's value is included within the values of an array field that is a sibling
     * @param {String} key
     * @param {function} [checkFn]
     * @param {String} [msg]
     * @return {this}
     */
    public oneOfArraySiblingFieldValues(key: string, checkFn?: CheckFunction, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value is not allowed.';
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                if (!checkFn) {
                    checkFn = (compare, value) => compare.includes(value);
                }

                const compare = getFieldValueFromKeyString(key, siblings);
                if (Array.isArray(compare)) {
                    return checkFn(compare, value);
                } else {
                    console.warn('Attempted to use oneOfArraySiblingFieldValues validator on a non array field. This is not possible.');
                    return false;
                }
            },
            msg,
        ]);

        return this;
    }

    /**
     * Checks if the value is one included in the provided array
     * @param {Array} values
     * @param {String} [msg]
     * @return {this}
     */
    public oneOf(values: Array<ValueType>, msg?: string): this {
        if (msg === undefined) {
            msg = 'This value must be one of these: ' + values.join(', ');
        }

        this.validateFuncs.push([
            (value) => {
                return values.includes(value);
            },
            msg,
        ]);

        return this;
    }

    /**
     * Validates a value
     * @param value
     * @param otherValues
     * @param siblings
     * @return {*}
     */
    public validate(value: ValueType, otherValues: ShapeValues = {}, siblings: ShapeValues = {}): ValidationResult {
        let ret: ValidationResult;
        if (this.dependent) {
            ret = this.validateDependent(value, otherValues, siblings);
        } else {
            ret = this.validateIndependent(value, otherValues, siblings);
        }

        if (!ret[0] && typeof this.onError === 'function') {
            this.onError(value, otherValues);
        } else if (ret[0] && typeof this.mutationFunc === 'function') {
            ret[1] = this.mutationFunc(ret[1], otherValues, siblings);
        }

        return ret;
    }

    /**
     * Returns the validator's default value
     * @return {ValueType}
     */
    public getDefaultValue(): ValueType {
        return this.defaultValue;
    }

    /**
     * Returns the validator's PropTypes representation
     * @return {Object}
     */
    public getPropType(): PropType {
        return this.isRequired ? this.propType.isRequired : this.propType;
    }
}

export default BaseValidator;
