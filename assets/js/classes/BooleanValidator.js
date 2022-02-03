import BaseValidator from './BaseValidator';

class BooleanValidator extends BaseValidator {
    /**
     * Validate a boolean field
     * @param {Array} [dependent]
     * @param {String} [defaultErrorMsg]
     * @param {Boolean} [defaultValue]
     */
    constructor(dependent, defaultErrorMsg = 'This field has to be a boolean', defaultValue = false) {
        super(dependent, defaultErrorMsg, defaultValue);
        this.validateFuncs.push([value => (value === true || value === false || value === 'true' || value === 'false') ? String(value) : false, this.defaultErrorMsg]);
    }
}

export default BooleanValidator;
