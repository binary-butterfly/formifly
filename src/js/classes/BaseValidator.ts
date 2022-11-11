import PropTypes from 'prop-types';
import {getFieldValueFromKeyString} from '../helpers/generalHelpers';
import {
    CheckFunction,
    Dependent,
    DependentValidationResult,
    ErrorFunction,
    InputType,
    isValidatorStep,
    isValidatorStepArrayArray,
    MutationFunction,
    ValidateFunction,
    ValidationResult,
    ValidatorStep,
    Value,
} from '../types';


/**
 * The validator that all validators extend.
 * Probably should not be used on its own
 */
class BaseValidator<T extends Value> {
    public defaultInputType: InputType = 'text';
    protected _isRequired: boolean = false;

    private requiredError?: string;
    protected validateFuncs: Array<ValidateFunction<T>> = [];
    protected defaultErrorMsg: string;
    private dependent: Dependent;
    private defaultValue: T;
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
    constructor(defaultValue: T,
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
     * @deprecated defaultInputType is a public attribute
     */
    public setDefaultInputType(newDefaultInputType: InputType): void {
        this.defaultInputType = newDefaultInputType;
    }

    /**
     * Sets the default value for this validator
     * @param {any} newDefaultValue
     */
    public setDefaultValue(newDefaultValue: T): void {
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

    protected validateRequired(value?: T | string): boolean {
        return (value !== '' && value !== null && value !== undefined && (!(value instanceof Array) || value.length > 0));
    }

    /**
     * Enforces a value to be set
     * @param [msg] - The error message that is displayed when the value is invalid
     * @return {this}
     */
    public required(msg: string = 'This field is required'): this {
        this._isRequired = true;
        this.requiredError = msg;
        return this;
    }

    public get isRequired(): boolean {
        return this._isRequired;
    }

    /**
     * Makes the validation fail in all cases.
     * This may be useful for dependent validators.
     * @param [msg] - The error message that is displayed
     * @return {this}
     */
    public alwaysFalse(msg: string = 'This validator will never return true'): this {
        this.validateFuncs.push(() => ({success: false, errorMsg: msg}));
        return this;
    }

    private validateDependentStep(
        step: ValidatorStep | boolean, value: T | string | undefined, otherValues: Value, siblings: Value
    ): DependentValidationResult<T> {
        const dependentValue = getFieldValueFromKeyString(Array.isArray(step) ? step[0] : '', otherValues);
        if (isValidatorStep(step) && step[1](dependentValue, value)) {
            return [true, step[2].validate(value, otherValues, siblings)];
        } else {
            return [false];
        }
    }

    private validateDependent(value: T | undefined, otherValues: Value, siblings: Value): ValidationResult<T> {
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

    private validateIndependent(value: T | undefined, otherValues: Value, siblings: Value): ValidationResult<T> {
        if (!this.validateRequired(value)) {
            if (this._isRequired) {
                return [false, this.requiredError ?? this.defaultErrorMsg];
            }
        } else {
            for (const func of this.validateFuncs) {
                const test = func(value, otherValues, siblings);
                if (!test.success) {
                    return [false, test.errorMsg];
                } else if (test.changedValue !== undefined) {
                    // Allows validators to modify the value
                    value = test.changedValue;
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
        const errorMsg = msg ?? 'This value must be greater than the value of ' + name;

        this.validateFuncs.push(
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return {success: value as T > otherVal, errorMsg};
            }
        );

        return this;
    }

    /**
     * Check if the fields value is less than another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public lessThan(name: string, msg?: string): this {
        const errorMsg = msg ?? 'This value must be less than the value of ' + name;

        this.validateFuncs.push(
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return {success: (value as T) < otherVal, errorMsg};
            }
        );

        return this;
    }

    /**
     * Check if the fields value is greater than or equal to another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public greaterOrEqualTo(name: string, msg?: string): this {
        const errorMsg = msg ?? 'This value must be greater than or equal to the value of ' + name;

        this.validateFuncs.push(
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return {success: value as T >= otherVal, errorMsg};
            }
        );

        return this;
    }

    /**
     * Check if the fields value is less than or equal to another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
     */
    public lessOrEqualTo(name: string, msg?: string): this {
        const errorMsg = msg ?? 'This value must be less than or equal to the value of ' + name;

        this.validateFuncs.push(
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return {success: (value as T) <= otherVal, errorMsg};
            }
        );

        return this;
    }

    /**
     * Check if the fields value is greater than the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public greaterThanSibling(key: string | number, msg?: string): this {
        const errorMsg = msg ?? 'This value must be greater than the value of its sibling ' + key;

        this.validateFuncs.push(
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return {success: value as T > otherVal, errorMsg};
            }
        );

        return this;
    }

    /**
     * Check if the fields value is less than the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public lessThanSibling(key: string | number, msg?: string): this {
        const errorMsg = msg ?? 'This value must be less than the value of its sibling ' + key;

        this.validateFuncs.push(
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return {success: (value as T) < otherVal, errorMsg};
            }
        );

        return this;
    }

    /**
     * Check if the fields value is greater or equal to the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public greaterOrEqualToSibling(key: string | number, msg?: string): this {
        const errorMsg = msg ?? 'This value must be greater than or equal to the value of its sibling ' + key;

        this.validateFuncs.push(
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return {success: value as T >= otherVal, errorMsg};
            }
        );

        return this;
    }

    /**
     * Check if the fields value is less than or equal to the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {this}
     */
    public lessOrEqualToSibling(key: string | number, msg?: string): this {
        const errorMsg = msg ?? 'This value must be less than or equal to the value of its sibling ' + key;

        this.validateFuncs.push(
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return {success: (value as T) <= otherVal, errorMsg};
            },
        );

        return this;
    }

    /**
     * Checks if the field's value is included within the values of an array field
     * @param {String} key
     * @param {function} [checkFn]
     * @param {String} [msg]
     * @return {this}
     */
    public oneOfArrayFieldValues(key: string, checkFn?: CheckFunction<T>, msg?: string): this {
        const errorMsg = msg ?? 'This value is not allowed.';

        this.validateFuncs.push(
            (value, otherValues) => {
                if (!checkFn) {
                    checkFn = (compare, value) => compare.includes(value as T);
                }

                const compare = getFieldValueFromKeyString(key, otherValues) as T[];
                if (Array.isArray(compare)) {
                    return {success: checkFn(compare, value), errorMsg};
                } else {
                    console.warn('Attempted to use oneOfArrayFieldValues validator on a non array field. This is not possible.');
                    return {success: false, errorMsg};
                }
            }
        );

        return this;
    }

    /**
     * Checks if the field's value is included within the values of an array field that is a sibling
     * @param {String} key
     * @param {function} [checkFn]
     * @param {String} [msg]
     * @return {this}
     */
    public oneOfArraySiblingFieldValues(key: string, checkFn?: CheckFunction<T>, msg?: string): this {
        const errorMsg = msg ?? 'This value is not allowed.';

        this.validateFuncs.push(
            (value, otherValues, siblings) => {
                if (!checkFn) {
                    checkFn = (compare, value) => compare.includes(value as T);
                }

                const compare = getFieldValueFromKeyString(key, siblings) as T[];
                if (Array.isArray(compare)) {
                    return {success: checkFn(compare, value), errorMsg};
                } else {
                    console.warn('Attempted to use oneOfArraySiblingFieldValues validator on a non array field. This is not possible.');
                    return {success: false, errorMsg};
                }
            }
        );

        return this;
    }

    /**
     * Checks if the value is one included in the provided array
     * @param {Array} values
     * @param {String} [msg]
     * @return {this}
     */
    public oneOf(values: Array<T | string>, msg?: string): this {
        const errorMsg = msg ?? 'This value must be one of these: ' + values.join(', ');

        this.validateFuncs.push(
            (value) => {
                return {success: values.includes(value as T), errorMsg};
            }
        );

        return this;
    }

    /**
     * Validates a value
     * @param value
     * @param otherValues
     * @param siblings
     * @return {*}
     */
    public validate(value?: T, otherValues: Value = {}, siblings: Value = {}): ValidationResult<T> {
        let ret: ValidationResult<T>;
        if (this.dependent) {
            ret = this.validateDependent(value, otherValues, siblings);
        } else {
            ret = this.validateIndependent(value, otherValues, siblings);
        }

        if (!ret[0] && this.onError) {
            this.onError(value, otherValues);
        } else if (ret[0] && this.mutationFunc) {
            ret[1] = this.mutationFunc(ret[1], otherValues, siblings);
        }

        return ret;
    }

    /**
     * Returns the validator's default value
     * @return {Value}
     */
    public getDefaultValue(): T {
        return this.defaultValue;
    }

    /**
     * Returns the validator's PropTypes representation
     * @return {Object}
     */
    public getPropType(): PropTypes.Validator<any> {
        return this._isRequired ? this.propType.isRequired : this.propType;
    }
}

export default BaseValidator;
