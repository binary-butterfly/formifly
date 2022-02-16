import BaseValidator from './BaseValidator';

class BooleanValidator extends BaseValidator {
    /**
     * Validate a boolean field
     * @param {Boolean} [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {Array} [dependent]
     */
    constructor(defaultValue = false, defaultErrorMsg = 'This field has to be a boolean', dependent) {
        super(defaultValue, defaultErrorMsg, dependent);
        this.validateFuncs.push([value => (value === true || value === false || value === 'true' || value === 'false') ? String(value) : false, this.defaultErrorMsg]);
    }
}

export default BooleanValidator;
