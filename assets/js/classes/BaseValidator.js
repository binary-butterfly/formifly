import PropTypes from 'prop-types';
import {getFieldValueFromKeyString} from '../helpers/generalHelpers';

class BaseValidator {
    defaultInputType = 'text';
    validateFuncs = [];
    isRequired = false;
    defaultErrorMsg = '';
    dependent = false;
    defaultValue = '';
    propType = PropTypes.any;
    onError;
    mutationFunc;

    /**
     * Validates a field
     * @param [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array|Boolean} [dependent]
     */
    constructor(defaultValue = '', defaultErrorMsg = null, mutationFunc, onError, dependent = false) {
        this.defaultErrorMsg = defaultErrorMsg ?? 'There is an error within this field';
        this.mutationFunc = mutationFunc;
        this.onError = onError;
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

    validateDependent(value, otherValues, siblings) {
        const dependentValue = getFieldValueFromKeyString(this.dependent[0], otherValues);
        if (this.dependent[1](dependentValue, value)) {
            return this.dependent[2].validate(value, otherValues, siblings);
        } else {
            return this.validateIndependent(value, otherValues, siblings);
        }
    }

    validateIndependent(value, otherValues, siblings) {
        for (const entry of this.validateFuncs) {
            if (!this.isRequired && !this.validateRequired(value)) {
                // Skip validation for empty value if required is false
                continue;
            }

            const func = entry[0];
            const test = func(value, otherValues, siblings);
            if (test === false) {
                return [false, entry[1] ?? this.defaultErrorMsg];
            } else if (test !== true) {
                // Allows validators to modify the value
                value = test;
            }
        }

        return [true, value];
    }

    /**
     * Check if the fields value is greater than another value
     * @param {String} name
     * @param {String} [msg]
     * @return {BaseValidator}
     */
    greaterThan(name, msg) {
        if (msg === undefined) {
            msg = 'This value must be greater than the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return value > otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than another value
     * @param {String} name
     * @param {String} [msg]
     * @return {BaseValidator}
     */
    lessThan(name, msg) {
        if (msg === undefined) {
            msg = 'This value must be less than the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return value < otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is greater than or equal to another value
     * @param {String} name
     * @param {String} [msg]
     * @return {BaseValidator}
     */
    greaterOrEqualTo(name, msg) {
        if (msg === undefined) {
            msg = 'This value must be greater than or equal to the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return value >= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than or equal to another value
     * @param {String} name
     * @param {String} [msg]
     * @return {BaseValidator}
     */
    lessOrEqualTo(name, msg) {
        if (msg === undefined) {
            msg = 'This value must be less than or equal to the value of ' + name;
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const otherVal = getFieldValueFromKeyString(name, otherValues);
                return value <= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is greater than the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {BaseValidator}
     */
    greaterThanSibling(key, msg) {
        if (msg === undefined) {
            msg = 'This value must be greater than the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return value > otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {BaseValidator}
     */
    lessThanSibling(key, msg) {
        if (msg === undefined) {
            msg = 'This value must be less than the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return value < otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is greater or equal to the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {BaseValidator}
     */
    greaterOrEqualToSibling(key, msg) {
        if (msg === undefined) {
            msg = 'This value must be greater than or equal to the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return value >= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Check if the fields value is less than or equal to the value of one of its siblings
     * @param {String|Number} key
     * @param {String} [msg]
     * @return {BaseValidator}
     */
    lessOrEqualToSibling(key, msg) {
        if (msg === undefined) {
            msg = 'This value must be less than or equal to the value of its sibling ' + key;
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const otherVal = getFieldValueFromKeyString(key, siblings);
                return value <= otherVal;
            },
            msg,
        ]);

        return this;
    }

    /**
     * Checks if the value is one included in the provided array
     * @param {Array} values
     * @param {String} [msg]
     * @return {BaseValidator}
     */
    oneOf(values, msg) {
        if (msg === undefined) {
            msg = 'This value must be one of these: ' + values.join(', ');
        }

        this.validateFuncs.push([
            (value) => {
                return values.includes(value);
            },
            msg,
        ]);

        return this;
    }

    validate(value, otherValues = {}, siblings = {}) {
        let ret;
        if (this.dependent) {
            ret = this.validateDependent(value, otherValues, siblings);
        } else {
            ret = this.validateIndependent(value, otherValues, siblings);
        }

        if (!ret[0] && typeof this.onError === 'function') {
            this.onError(value, otherValues);
        } else if (ret[0] && typeof this.mutationFunc === 'function') {
            ret[1] = this.mutationFunc(ret[1], otherValues, siblings);
        }

        return ret;
    }

    getDefaultValue() {
        return this.defaultValue;
    }

    getPropType() {
        return this.isRequired ? this.propType.isRequired : this.propType;
    }
}

export default BaseValidator;
