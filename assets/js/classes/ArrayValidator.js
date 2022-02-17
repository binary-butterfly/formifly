import PropTypes from 'prop-types';
import {ensureValueIsNumeric} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';

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
    constructor(of, defaultMessage, mutationFunc, onError, dependent) {
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
            this.isRequired = true;
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
            this.isRequired = true;
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
        let ret = [
            this.of.getDefaultValue(),
        ];
        for (let c = 1; c < this.minChildCount; c++) {
            ret.push(ret[0]);
        }
        return ret;
    }

    validate(values, otherValues = {}) {
        // First we validate the amount of entries as well as dependent filters and requirement filters
        const preValidate = super.validate(values, otherValues);
        if (preValidate[0] === false) {
            return preValidate;
        }

        // Then, if the amount is correct, we validate the specific entries
        const tests = [];
        let allOk = true;
        for (const index in values) {
            const value = values[index];

            const test = this.of.validate(value, otherValues);
            tests.push(test);
            if (test[0] === false) {
                allOk = false;
            } else if (allOk) {
                values[index] = test[1];
            }
        }

        return allOk ? [true, values] : [false, tests];
    }
}

export default ArrayValidator;
