import BaseValidator from './BaseValidator';

class BooleanValidator extends BaseValidator {
    defaultInputType = 'checkbox';

    /**
     * Validate a boolean field
     * @param {Boolean} [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     */
    constructor(defaultValue = false, defaultErrorMsg = 'This field has to be a boolean', onError, dependent) {
        super(defaultValue, defaultErrorMsg, onError, dependent);
        this.validateFuncs.push([value => (value === true || value === false || value === 'true' || value === 'false') ? String(value) : false, this.defaultErrorMsg]);
    }
}

export default BooleanValidator;
