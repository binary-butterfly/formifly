import BaseValidator from './BaseValidator';

class BooleanValidator extends BaseValidator {
    /**
     * Validate a boolean field
     * @param dependent
     * @param defaultErrorMsg
     */
    constructor(dependent, defaultErrorMsg = 'This field has to be a boolean') {
        super(dependent, defaultErrorMsg);
        this.validateFuncs.push([value => (value === true || value === false || value === 'true' || value === 'false') ? String(value) : false, this.defaultErrorMsg]);
    }
}

export default BooleanValidator;
