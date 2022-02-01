import BaseValidator from './BaseValidator';

class ObjectValidator extends BaseValidator {

    fields = {};

    constructor(fields, dependent, defaultMessage) {
        super(dependent, defaultMessage);
        this.fields = fields;
    }

    validate(value, otherValues) {
        for (const fieldName in this.fields) {
            const test = this.fields[fieldName].validate(value[fieldName], value);
            if (test[0] === false) {
                return [false, test[1]];
            } else {
                value[fieldName] = test[1];
            }
        }
        return [true, value];
    }
}

export default ObjectValidator;
