import PropTypes from 'prop-types';
import BaseValidator from './BaseValidator';

/**
 * A validator that allows you to validate boolean fields.
 * @extends BaseValidator
 */
class BooleanValidator extends BaseValidator {
    defaultInputType = 'checkbox';
    propType = PropTypes.bool;
    realBool;

    /**
     * Validate a boolean field
     * @param {Boolean} [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     * @param {Boolean} [realBool]
     */
    constructor(defaultValue = false, defaultErrorMsg = 'This field has to be a boolean', mutationFunc, onError, dependent, realBool = false) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);
        this.validateFuncs.push([value => (value === true || value === false || value === 'true' || value === 'false') ? String(value) : false, this.defaultErrorMsg]);
        this.realBool = realBool;
    }

    setRealBool(newRealBool) {
        this.realBool = newRealBool;
    }

    validate(value, otherValues = {}, siblings = {}) {
        const result = super.validate(value, otherValues, siblings);
        if (result[0] && this.realBool) {
            return [result[0], result[1] === 'true'];
        } else {
            return result;
        }
    }
}

export default BooleanValidator;
