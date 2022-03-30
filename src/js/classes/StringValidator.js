import PropTypes from 'prop-types';
import {ensureValueIsNumeric, ensureValueIsRegexp} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';

/**
 * A validator that allows you to validate string fields.
 * @extends BaseValidator
 */
class StringValidator extends BaseValidator {
    defaultInputType = 'text';
    propType = PropTypes.string;

    /**
     * Match the string against a regular expression
     * @param {RegExp} expr
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    regex(expr, msg = 'This value is malformed') {
        ensureValueIsRegexp(expr, 'regex', 'StringValidator', 'expr');
        this.validateFuncs.push([(value) => expr.test(value), msg]);
        return this;
    }

    /**
     * Enforce a minimum length (inclusive) of the string
     * @param {Number} num
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    minLength(num, msg) {
        if (msg === undefined) {
            msg = 'This string must be at least ' + num + ' characters long';
        } else {
            msg = msg.replace('{{num}}', String(num));
        }
        ensureValueIsNumeric(num, 'minLength', 'StringValidator', 'num');
        this.validateFuncs.push([value => value.length >= num, msg]);
        return this;
    }

    /**
     * Enforce a maximum length (inclusive) of the string
     * @param {Number} num
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    maxLength(num, msg) {
        if (msg === undefined) {
            msg = 'This string must be no longer than ' + num + ' characters';
        } else {
            msg = msg.replace('{{num}}', String(num));
        }
        ensureValueIsNumeric(num, 'maxLength', 'StringValidator', 'num');
        this.validateFuncs.push([value => value.length <= num, msg]);
        return this;
    }

    /**
     * Enforce a string length between two numbers (inclusive)
     * @param {Number} min
     * @param {Number} max
     * @param {String} [msg] - The error message that is displayed when the value is invalid
     * @returns {this}
     */
    lengthRange(min, max, msg) {
        if (msg === undefined) {
            msg = 'This string must be between ' + min + ' and ' + max + ' characters long';
        } else {
            msg = msg.replace('{{min}}', String(min));
            msg = msg.replace('{{max}}', String(max));
        }
        ensureValueIsNumeric(min, 'lengthRange', 'StringValidator', 'min');
        ensureValueIsNumeric(max, 'lengthRange', 'StringValidator', 'max');
        this.validateFuncs.push([value => value.length >= min && value.length <= max, msg]);
        return this;
    }
}

export default StringValidator;
