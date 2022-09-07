import PropTypes from 'prop-types';
import {ensureValueIsNumeric} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';
import ObjectValidator from './ObjectValidator';

/**
 * A validator that allows you to validate array fields.
 * @extends BaseValidator
 *
 * @property {BaseValidator|AnyOfValidator|ArrayValidator|BooleanValidator|EmailValidator|NumberValidator|ObjectValidator|PhoneNumberValidator|StringValidator} of  - The validator of what this is an array of
 */
class ArrayValidator extends BaseValidator {
    of;
    minChildCount = 0;
    maxChildCount;
    defaultInputType = 'select';

    /**
     * Validate an array of fields
     * @param {BaseValidator} of
     * @param {String} [defaultMessage]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     */
    constructor(of, defaultMessage = 'This field has to be an array', mutationFunc, onError, dependent) {
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
    minLength(num, msg) {
        ensureValueIsNumeric(num, 'minLength', 'ArrayValidator', 'num');
        if (msg === undefined) {
            msg = 'There must be at least ' + num + ' entries for this';
        } else {
            msg = msg.replace('{{num}}', String(num));
        }
        this.validateFuncs.push([values => values.length >= num, msg]);

        if (num > 0) {
            this.required(msg);
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
    maxLength(num, msg) {
        ensureValueIsNumeric(num, 'maxLength', 'ArrayValidator', 'num');
        if (msg === undefined) {
            msg = 'There must be at most ' + num + ' entries for this';
        } else {
            msg = msg.replace('{{num}}', String(num));
        }
        this.validateFuncs.push([values => values.length <= num, msg]);
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
    lengthRange(min, max, msg) {
        ensureValueIsNumeric(min, 'lengthRange', 'ArrayValidator', 'min');
        ensureValueIsNumeric(max, 'lengthRange', 'ArrayValidator', 'max');
        if (msg === undefined) {
            msg = 'There must be between ' + min + ' and ' + max + ' entries for this';
        } else {
            msg = msg.replace('{{min}}', String(min));
            msg = msg.replace('{{max}}', String(max));
        }
        this.validateFuncs.push([values => values.length >= min && values.length <= max, msg]);

        if (min > 0) {
            this.required(msg);
        }
        this.minChildCount = min;
        this.maxChildCount = max;
        return this;
    }

    /**
     * Get the default value for the array's children
     * @return {*[]}
     */
    getDefaultValue() {
        const fieldDefault = this.of.getDefaultValue();
        let ret = [];
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
    validateWithoutRecursion(values, otherValues, siblings) {
        return this.validate(values, otherValues, siblings, false);
    }

    validate(values, otherValues = {}, siblings = {}, recursion = true) {
        // First we validate the amount of entries as well as dependent filters and requirement filters
        const preValidate = super.validate(values, otherValues, siblings);
        if (preValidate[0] === false) {
            return preValidate;
        }

        if (Array.isArray(values) === false) {
            return [false, this.defaultErrorMsg];
        }

        // Then, if the amount is correct, we validate the specific entries
        const tests = [];

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
