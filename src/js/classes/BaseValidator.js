import PropTypes from 'prop-types';
import {getFieldValueFromKeyString} from '../helpers/generalHelpers';

/**
 * The validator that all validators extend.
 * Probably should not be used on its own
 */
class BaseValidator {
    defaultInputType = 'text';
    requiredError;
    validateFuncs = [];
    isRequired = false;
    defaultErrorMsg = '';
    dependent = false;
    defaultValue = '';
    propType = PropTypes.any;
    onError;
    mutationFunc;

    /**
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

    /**
     * Sets the input type that will be passed to fields that this validator validates
     * @param {String} newDefaultInputType
     */
    setDefaultInputType(newDefaultInputType) {
        this.defaultInputType = newDefaultInputType;
    }

    /**
     * Sets the default value for this validator
     * @param {any} newDefaultValue
     */
    setDefaultValue(newDefaultValue) {
        this.defaultValue = newDefaultValue;
    }

    /**
     * Sets the default error message for this validator
     * @param {String} newDefaultErrorMsg
     */
    setDefaultErrorMsg(newDefaultErrorMsg) {
        this.defaultErrorMsg = newDefaultErrorMsg;
    }

    /**
     * Set the validators mutation function
     * @param {function} newMutationFunc
     */
    setMutationFunc(newMutationFunc) {
        this.mutationFunc = newMutationFunc;
    }

    /**
     * Set the validators onError handler
     * @param {function} newOnError
     */
    setOnError(newOnError) {
        this.onError = newOnError;
    }

    /**
     * Set the validators dependent field
     * @param {Array|boolean} newDependent
     */
    setDependent(newDependent) {
        this.dependent = newDependent;
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
        this.requiredError = msg;
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

    validateDependentStep(step, value, otherValues, siblings) {
        const dependentValue = getFieldValueFromKeyString(step[0], otherValues);
        if (step[1](dependentValue, value)) {
            return [true, step[2].validate(value, otherValues, siblings)];
        } else {
            return [false];
        }
    }

    validateDependent(value, otherValues, siblings) {
        if (Array.isArray(this.dependent[0])) {
            for (const step of this.dependent[0]) {
                const validated = this.validateDependentStep(step, value, otherValues, siblings);
                if (validated[0]) {
                    return (validated[1]);
                }
            }
        } else {
            const validated = this.validateDependentStep(this.dependent, value, otherValues, siblings);
            if (validated[0]) {
                return validated[1];
            }
        }

        return this.validateIndependent(value, otherValues, siblings);
    }

    validateIndependent(value, otherValues, siblings) {
        if (!this.validateRequired(value)) {
            if (this.isRequired) {
                return [false, this.requiredError ?? this.defaultErrorMsg];
            }
        } else {
            for (const entry of this.validateFuncs) {
                const func = entry[0];
                const test = func(value, otherValues, siblings);
                if (test === false) {
                    return [false, entry[1]];
                } else if (test !== true) {
                    // Allows validators to modify the value
                    value = test;
                }
            }
        }

        return [true, value];
    }

    /**
     * Check if the fields value is greater than another value
     * @param {String} name
     * @param {String} [msg]
     * @return {this}
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
     * @return {this}
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
     * @return {this}
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
     * @return {this}
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
     * @return {this}
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
     * @return {this}
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
     * @return {this}
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
     * @return {this}
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
     * Checks if the field's value is included within the values of an array field
     * @param {String} key
     * @param {function} [checkFn]
     * @param {String} [msg]
     * @return {this}
     */
    oneOfArrayFieldValues(key, checkFn, msg) {
        if (msg === undefined) {
            msg = 'This value is not allowed.';
        }

        if (checkFn === undefined) {
            checkFn = (compare, value) => compare.includes(value);
        }

        this.validateFuncs.push([
            (value, otherValues) => {
                const compare = getFieldValueFromKeyString(key, otherValues);
                if (Array.isArray(compare)) {
                    return checkFn(compare, value);
                } else {
                    console.warn('Attempted to use oneOfArrayFieldValues validator on a non array field. This is not possible.');
                    return false;
                }
            },
            msg,
        ]);

        return this;
    }

    /**
     * Checks if the field's value is included within the values of an array field that is a sibling
     * @param {String} key
     * @param {function} [checkFn]
     * @param {String} [msg]
     * @return {this}
     */
    oneOfArraySiblingFieldValues(key, checkFn, msg) {
        if (msg === undefined) {
            msg = 'This value is not allowed.';
        }

        if (checkFn === undefined) {
            checkFn = (compare, value) => compare.includes(value);
        }

        this.validateFuncs.push([
            (value, otherValues, siblings) => {
                const compare = getFieldValueFromKeyString(key, siblings);
                if (Array.isArray(compare)) {
                    return checkFn(compare, value);
                } else {
                    console.warn('Attempted to use oneOfArraySiblingFieldValues validator on a non array field. This is not possible.');
                    return false;
                }
            },
            msg,
        ]);

        return this;
    }

    /**
     * Checks if the value is one included in the provided array
     * @param {Array} values
     * @param {String} [msg]
     * @return {this}
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

    /**
     * Validates a value
     * @param value
     * @param otherValues
     * @param siblings
     * @return {*}
     */
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

    /**
     * Returns the validator's default value
     * @return {any}
     */
    getDefaultValue() {
        return this.defaultValue;
    }

    /**
     * Returns the validator's PropTypes representation
     * @return {Validator<NonNullable<any>>|Requireable<any>}
     */
    getPropType() {
        return this.isRequired ? this.propType.isRequired : this.propType;
    }
}

export default BaseValidator;
