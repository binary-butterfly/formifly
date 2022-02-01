import {ensureValueIsNumeric, ensureValueIsRegexp} from '../helpers/developerInputValidators';
import BaseValidator from './BaseValidator';

class StringValidator extends BaseValidator {
    /**
     * Match the string against a regular expression
     * @param {RegExp} expr
     * @returns {StringValidator}
     */
    regex(expr) {
        ensureValueIsRegexp(expr, 'regex', 'StringValidator', 'expr');
        this.validateFuncs.push((value) => expr.test(value));
        return this;
    }

    /**
     * Enforce a minimum length (inclusive) of the string
     * @param {Number} num
     * @returns {StringValidator}
     */
    minLength(num) {
        ensureValueIsNumeric(num, 'minLength', 'StringValidator', 'num');
        this.validateFuncs.push(value => value.length >= num);
        return this;
    }

    /**
     * Enforce a maximum length (inclusive) of the string
     * @param {Number} num
     * @returns {StringValidator}
     */
    maxLength(num) {
        ensureValueIsNumeric(num, 'maxLength', 'StringValidator', 'num');
        this.validateFuncs.push(value => value.length <= num);
        return this;
    }

    /**
     * Enforce a string length between two numbers (inclusive)
     * @param {Number} min
     * @param {Number} max
     * @returns {StringValidator}
     */
    lengthRange(min, max) {
        ensureValueIsNumeric(min, 'lengthRange', 'StringValidator', 'min');
        ensureValueIsNumeric(max, 'lengthRange', 'StringValidator', 'max');
        this.validateFuncs.push(value => value.length >= min && value.length <= max);
        return this;
    }
}

export default StringValidator;
