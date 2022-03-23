import PropTypes from 'prop-types';
import BaseValidator from './BaseValidator';

class ObjectValidator extends BaseValidator {
    fields = {};
    dropEmpty;

    /**
     * @param {Object} fields
     * @param {String} [defaultMessage]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Boolean} [dropEmpty]
     * @param {Array} [dependent]
     */
    constructor(fields, defaultMessage, mutationFunc, onError, dependent, dropEmpty = true) {
        super(undefined, defaultMessage, mutationFunc, onError, dependent);
        this.fields = fields;
        this.dropEmpty = dropEmpty;
    }

    setDropEmpty(newDropEmpty) {
        this.dropEmpty = newDropEmpty;
    }

    /**
     * @return {{}}
     */
    getDefaultValue() {
        let ret = {};
        for (const fieldName in this.fields) {
            ret[fieldName] = this.fields[fieldName].getDefaultValue();
        }
        return ret;
    }

    validate(value, otherValues, siblings) {
        const preValidate = super.validate(value, otherValues, siblings);
        if (!preValidate[0]) {
            return preValidate;
        }

        // Unpack the test value to avoid mutating the original object
        let testValue = {...value};
        let allOk = true;
        let tests = {};
        for (const fieldName in this.fields) {
            const test = this.fields[fieldName].validate(testValue[fieldName], otherValues, testValue);
            tests[fieldName] = test;
            if (test[0] === false) {
                allOk = false;
            } else if (allOk) {
                if (this.dropEmpty) {
                    if (Array.isArray(test[1])) {
                        const filtered = test[1].filter((val) => val !== '');
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
