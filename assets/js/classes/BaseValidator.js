import {getFieldValueFromKeyString} from '../helpers/generalHelpers';

class BaseValidator {
    validateFuncs = [];
    isRequired = false;
    defaultErrorMsg = '';
    dependent = false;
    defaultValue = '';

    /**
     * Validates a field
     * @param [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {Array|Boolean} [dependent]
     */
    constructor(defaultValue = '', defaultErrorMsg = null, dependent = false) {
        this.defaultErrorMsg = defaultErrorMsg ?? 'There is an error within this field';
        this.dependent = dependent;
        this.defaultValue = defaultValue;
    }

    validateRequired(value) {
        return (value !== '' && value !== null && value !== undefined && (!(value instanceof Array) || value.length > 0));
    }

    /**
     * Enforces a value to be set
     * @param [msg] - The error message that is displayed when the value is invalid
     * @return {this}
     */
    required(msg = 'This field is required') {
        this.isRequired = true;
        this.validateFuncs.push([this.validateRequired, msg]);
        return this;
    }

    /**
     * Makes the validation fail in all cases.
     * This may be useful for dependent validators.
     * @param [msg] - The error message that is displayed
     * @return {this}
     */
    alwaysFalse(msg = 'This validator will never return true') {
        this.validateFuncs.push([() => false, msg]);
        return this;
    }

    validateDependent(value, otherValues) {
        const dependentValue = getFieldValueFromKeyString(this.dependent[0], otherValues);
        if (this.dependent[1](dependentValue, value)) {
            return this.dependent[2].validate(value, otherValues);
        } else {
            return this.validateIndependent(value);
        }
    }

    validateIndependent(value) {
        for (const entry of this.validateFuncs) {
            if (!this.isRequired && !this.validateRequired(value)) {
                // Skip validation for empty value if required is false
                continue;
            }

            const func = entry[0];
            const test = func(value);
            if (test === false) {
                return [false, entry[1] ?? this.defaultErrorMsg];
            } else if (test !== true) {
                // Allows validators to modify the value
                value = test;
            }
        }
        return [true, value];
    }

    validate(value, otherValues = {}) {
        if (this.dependent) {
            return this.validateDependent(value, otherValues);
        } else {
            return this.validateIndependent(value);
        }
    }

    getDefaultValue() {
        return this.defaultValue;
    }
}

export default BaseValidator;
