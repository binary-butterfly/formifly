import BaseValidator from './BaseValidator';

class ObjectValidator extends BaseValidator {

    fields = {};

    /**
     * @param {Object} fields
     * @param {Array} [dependent]
     * @param {String} [defaultMessage]
     */
    constructor(fields, dependent, defaultMessage) {
        super(dependent, defaultMessage);
        this.fields = fields;
    }

    validate(value, otherValues) {
        let allOk = true;
        let tests = {};
        for (const fieldName in this.fields) {
            const test = this.fields[fieldName].validate(value[fieldName], value);
            tests[fieldName] = test;
            if (test[0] === false) {
                allOk = false;
            } else if (allOk) {
                value[fieldName] = test[1];
            }
        }
        return allOk ? [true, value] : [false, tests];
    }
}

export default ObjectValidator;
