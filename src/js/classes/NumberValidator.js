import PropTypes from 'prop-types';
import {ensureValueIsNumeric} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';

const numRegexp = /^-?\d+([.,]\d+)?$/s;
const wholeNumRegexp = /^-?\d+$/s;

const delocalize = (value) => {
    return parseFloat(String(value).replace(',', '.'));
};

/**
 * A validator that allows you to validate numbers.
 * @extends BaseValidator
 */
class NumberValidator extends BaseValidator {
    defaultInputType = 'number';
    propType = PropTypes.number;
    minNum;
    maxNum;

    /**
     * Validate a numeric input field
     * @param {Boolean} wholeNumber - Set to true to only allow whole numbers
     * @param {String|Number} [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array|Boolean} [dependent]
     */
    constructor(wholeNumber = false, defaultValue = '', defaultErrorMsg, mutationFunc, onError, dependent) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);

        let regexpInUse;
        if (wholeNumber) {
            if (defaultErrorMsg === undefined) {
                defaultErrorMsg = 'This field must be a whole number';
            }
            regexpInUse = wholeNumRegexp;
        } else {
            if (defaultErrorMsg === undefined) {
                defaultErrorMsg = 'This field must be a number';
            }
            regexpInUse = numRegexp;
        }

        this.validateFuncs.push([
            value => {
                return regexpInUse.test(value) ? delocalize(value) : false;
            },
            defaultErrorMsg,
        ]);
    }

    /**
     * Ensure a minimum number (inclusive)
     * @param {Number} num
     * @param {String} [msg]
     * @return {this}
     */
    min(num, msg) {
        ensureValueIsNumeric(num, 'min', 'NumberValidator', 'num');
        if (msg === undefined) {
            msg = 'This value must be at least ' + num;
        } else {
            msg = msg.replace('{{num}}', String(num));
        }

        this.validateFuncs.push([value => value >= num, msg]);
        this.minNum = num;
        return this;
    }

    /**
     * Enforce a maximum value
     * @param {Number} num
     * @param {String} [msg]
     * @return {this}
     */
    max(num, msg) {
        ensureValueIsNumeric(num, 'max', 'NumberValidator', 'num');
        if (msg === undefined) {
            msg = 'This value must be at most ' + num;
        } else {
            msg = msg.replace('{{num}}', String(num));
        }

        this.validateFuncs.push([value => value <= num, msg]);
        this.maxNum = num;
        return this;
    }

    /**
     * Only allow positive numbers. (Excluding 0)
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    positive(msg = 'This value must be positive') {
        this.validateFuncs.push([value => value > 0, msg]);
        return this;
    }

    /**
     * Only allow negative numbers. (Excluding 0)
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    negative(msg = 'This value must be negative') {
        this.validateFuncs.push([value => value < 0, msg]);
        return this;
    }

    /**
     * Only allow numbers within an (inclusive) range
     * @param {Number} min
     * @param {Number} max
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    range(min, max, msg) {
        if (msg === undefined) {
            msg = 'This value must be between ' + min + ' and ' + max;
        } else {
            msg = msg.replace('{{min}}', String(min));
            msg = msg.replace('{{max}}', String(max));
        }

        ensureValueIsNumeric(min, 'range', 'NumberValidator', 'min');
        ensureValueIsNumeric(max, 'range', 'NumberValidator', 'max');
        this.validateFuncs.push([value => value >= min && value <= max, msg]);
        this.minNum = min;
        this.maxNum = max;
        return this;
    }

    /**
     * Converts the input number into a decimal string.
     * @param {Number} count
     * @returns {this}
     */
    decimalPlaces(count) {
        ensureValueIsNumeric(count, 'decimalPlaces', 'NumberValidator', 'count');
        this.validateFuncs.push([
            value => value.toFixed(count),
            'This is not a validator and should not return false.',
        ]);
        return this;
    }
}

export default NumberValidator;
