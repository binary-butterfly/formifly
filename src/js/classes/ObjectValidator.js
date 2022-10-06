import PropTypes from 'prop-types';
import ArrayValidator from './ArrayValidator';
import BaseValidator from './BaseValidator';

/**
 * A validator that allows you to validate object fields. It is also used as the base for any validation shape.
 * @extends BaseValidator
 *
 * @property {BaseValidator|AnyOfValidator|ArrayValidator|BooleanValidator|EmailValidator|NumberValidator|ObjectValidator|PhoneNumberValidator|StringValidator} fields  - The fields of the object
 */
class ObjectValidator extends BaseValidator {
    fields = {};
    dropEmpty;
    dropNotInShape;
    reallyNotRequired;

    /**
     * @param {Object} fields
     * @param {String} [defaultMessage]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     * @param {Boolean} [dropEmpty]
     * @param {Boolean} [dropNotInShape]
     */
    constructor(fields, defaultMessage, mutationFunc, onError, dependent, dropEmpty = true, dropNotInShape = false) {
        super(undefined, defaultMessage, mutationFunc, onError, dependent);
        this.fields = fields;
        this.dropEmpty = dropEmpty;
        this.dropNotInShape = dropNotInShape;
    }

    /**
     * Sets the object validator as non required
     * @returns {ObjectValidator}
     */
    notRequired() {
        this.isRequired = false;
        this.reallyNotRequired = true;
        return this;
    }

    /**
     * Make the validator drop empty keys
     * @param {Boolean} newDropEmpty
     */
    setDropEmpty(newDropEmpty) {
        this.dropEmpty = newDropEmpty;
    }

    /**
     * Make the validator drop values that are not defined as a child field
     * @param {Boolean} newDropNotInShape
     */
    setDropNotInShape(newDropNotInShape) {
        this.dropNotInShape = newDropNotInShape;
    }

    /**
     * @return {{}}
     */
    getDefaultValue() {
        const ret = {};
        for (const fieldName in this.fields) {
            ret[fieldName] = this.fields[fieldName].getDefaultValue();
        }
        return ret;
    }

    validateRequired(value) {
        if (typeof value === 'object') {
            return Object.keys(value).length > 0;
        } else {
            return super.validateRequired(value);
        }
    }

    /**
     * This function allows you to validate the ObjectValidator's child fields without validating any sub objects or array children.
     * @param {Object} value
     * @param {Object} [otherValues]
     * @param {Object} [siblings]
     * @return {*|[boolean, *]|[boolean, {}]}
     */
    validateWithoutRecursion(value, otherValues, siblings) {
        return this.validate(value, otherValues, siblings, false);
    }

    validate(value, otherValues, siblings, recursion = true) {
        if (this.reallyNotRequired && !this.validateRequired(value)) {
            return [true, value];
        }

        const preValidate = super.validate(value, otherValues, siblings);
        if (!preValidate[0]) {
            return preValidate;
        }

        // Unpack the test value to avoid mutating the original object
        const testValue = {...value};
        let allOk = true;
        const tests = {};
        for (const fieldName in this.fields) {
            if (!recursion) {
                if (this.fields[fieldName] instanceof ArrayValidator || this.fields[fieldName] instanceof ObjectValidator) {
                    continue;
                }
            }

            const test = this.fields[fieldName].validate(testValue[fieldName], otherValues, testValue);
            tests[fieldName] = test;
            if (test[0] === false) {
                allOk = false;
            } else if (allOk) {
                if (this.dropEmpty) {
                    if (Array.isArray(test[1])) {
                        const filtered = test[1].filter(val => val !== '');
                        if (filtered.length > 0) {
                            testValue[fieldName] = filtered;
                            continue;
                        }
                    } else if (test[1] !== '') {
                        testValue[fieldName] = test[1];
                        continue;
                    }
                    delete testValue[fieldName];
                } else {
                    testValue[fieldName] = test[1];
                }
            }
        }

        if (allOk && this.dropNotInShape) {
            for (const key in testValue) {
                if (this.fields[key] === undefined) {
                    delete testValue[key];
                }
            }
        }

        return allOk ? [true, testValue] : [false, tests];
    }

    /**
     * Returns the PropTypes representation of the validator.
     *
     * Set first to true to return an object instead of PropTypes.shape. This is useful if you want to assign this validator's PropType to the PropTypes of a component.
     * @param {Boolean} [first]
     * @return {any}
     */
    getPropType(first = false) {
        const types = {};
        for (const fieldName in this.fields) {
            types[fieldName] = this.fields[fieldName].getPropType();
        }

        if (first) {
            return types;
        } else {
            const shape = PropTypes.shape(types);
            return this.isRequired ? shape.isRequired : shape;
        }
    }
}

export default ObjectValidator;
