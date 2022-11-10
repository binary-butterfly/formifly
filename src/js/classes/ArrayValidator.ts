import PropTypes from 'prop-types';
import {ensureValueIsNumeric} from '../helpers/developerInputValidators';
import BaseValidator, {
    Dependent,
    ErrorFunction,
    InputType,
    MutationFunction,
    ValidationResult,
    ValueType,
} from './BaseValidator';
import ObjectValidator from './ObjectValidator';

/**
 * A validator that allows you to validate array fields.
 * @extends BaseValidator
 *
 * @property {BaseValidator|AnyOfValidator|ArrayValidator|BooleanValidator|EmailValidator|NumberValidator|ObjectValidator|PhoneNumberValidator|StringValidator} of  - The validator of what this is an array of
 */
class ArrayValidator<T extends ValueType> extends BaseValidator<Array<T>|string> {
    public readonly of: BaseValidator<any>;
    protected minChildCount: number = 0;
    protected maxChildCount?: number;
    public defaultInputType: InputType = 'select';

    /**
     * Validate an array of fields
     * @param {BaseValidator} of
     * @param {String} [defaultMessage]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     */
    constructor(of: BaseValidator<any>,
                defaultMessage = 'This field has to be an array',
                mutationFunc?: MutationFunction<Array<T>|string>,
                onError?: ErrorFunction,
                dependent?: Dependent) {
        super(undefined, defaultMessage, mutationFunc, onError, dependent);
        this.of = of;
        this.propType = PropTypes.arrayOf(of.getPropType());
    }

    /**
     * Enforce a minimum count (inclusive) of entries
     * @param {Number} num
     * @param {String} [msg]
     * @return {ArrayValidator}
     */
    public minLength(num: number, msg?: string): this {
        ensureValueIsNumeric(num, 'minLength', 'ArrayValidator', 'num');
        let errorMsg = msg ?? 'There must be at least ' + num + ' entries for this';
        errorMsg = errorMsg.replace('{{num}}', String(num));
        this.validateFuncs.push(values => ({success: values !== undefined && values.length >= num, errorMsg}));

        if (num > 0) {
            this.required(errorMsg);
        }
        this.minChildCount = num;
        return this;
    }

    /**
     * Enforce a maximum count (inclusive) of entries
     * @param {Number} num
     * @param {String} [msg]
     * @return {ArrayValidator}
     */
    public maxLength(num: number, msg?: string): this {
        ensureValueIsNumeric(num, 'maxLength', 'ArrayValidator', 'num');
        let errorMsg = msg ?? 'There must be at most ' + num + ' entries for this';
        errorMsg = errorMsg.replace('{{num}}', String(num));
        this.validateFuncs.push(values => ({success: values !== undefined && values.length <= num, errorMsg}));
        this.maxChildCount = num;
        return this;
    }

    /**
     * Enforce an entry count within an (inclusive) range
     * @param {Number} min
     * @param {Number} max
     * @param {String} [msg]
     * @return {ArrayValidator}
     */
    public lengthRange(min: number, max: number, msg?: string): this {
        ensureValueIsNumeric(min, 'lengthRange', 'ArrayValidator', 'min');
        ensureValueIsNumeric(max, 'lengthRange', 'ArrayValidator', 'max');
        let errorMsg = msg ?? 'There must be between ' + min + ' and ' + max + ' entries for this';
        errorMsg = errorMsg.replace('{{min}}', String(min));
        errorMsg = errorMsg.replace('{{max}}', String(max));
        this.validateFuncs.push(values => ({success: values !== undefined && values.length >= min && values.length <= max, errorMsg}));

        if (min > 0) {
            this.required(errorMsg);
        }
        this.minChildCount = min;
        this.maxChildCount = max;
        return this;
    }

    /**
     * Get the default value for the array's children
     * @return {*[]}
     */
    public getDefaultValue(): Array<T> {
        const fieldDefault = this.of.getDefaultValue();
        const ret: Array<T> = [];
        for (let c = 0; c < this.minChildCount; c++) {
            ret.push(fieldDefault);
        }
        return ret;
    }

    /**
     * This function allows you to validate all child fields non recursively.
     * Nothing will change if this.of is not an Array or ObjectValidator since it only applies to those.
     * This means that all of their fields except those that are either Array or ObjectValidators are validated.
     * @param {Array} values
     * @param {Object} [otherValues]
     * @param {any} [siblings]
     * @return {*|[boolean, *[]]|[boolean, *[]]}
     */
    public validateWithoutRecursion(
        values: Array<T>,
        otherValues?: ValueType,
        siblings?: ValueType
    ): ValidationResult<Array<T>|string> {
        return this.validate(values, otherValues, siblings, false);
    }

    public validate(
        values: Array<T>,
        otherValues = {},
        siblings = {},
        recursion = true
    ): ValidationResult<Array<T>|string> {
        // First we validate the amount of entries as well as dependent filters and requirement filters
        const preValidate = super.validate(values, otherValues, siblings);
        if (preValidate[0] === false) {
            return preValidate;
        }

        if (Array.isArray(values) === false) {
            return [false, this.defaultErrorMsg];
        }

        // Then, if the amount is correct, we validate the specific entries
        const tests: Array<ValidationResult<Array<ValueType>>> = [];

        let testFunc;
        if (recursion || !(this.of instanceof ObjectValidator || this.of instanceof ArrayValidator)) {
            testFunc = this.of.validate.bind(this.of);
        } else {
            testFunc = this.of.validateWithoutRecursion.bind(this.of);
        }

        // Unpack to avoid mutations
        const testValues = [...values];
        let allOk = true;
        for (const index in testValues) {
            const value = testValues[index];

            const test = testFunc(value, otherValues, testValues);
            tests.push(test);
            if (test[0] === false) {
                allOk = false;
            } else if (allOk) {
                testValues[index] = test[1];
            }
        }

        return allOk ? [true, testValues] : [false, tests];
    }
}

export default ArrayValidator;
