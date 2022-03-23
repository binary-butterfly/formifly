import PropTypes from 'prop-types';
import BaseValidator from './BaseValidator';

class ObjectValidator extends BaseValidator {
    fields = {};
    dropEmpty;
    dropNotInShape;

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
