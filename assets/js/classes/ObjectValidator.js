import PropTypes from 'prop-types';
import BaseValidator from './BaseValidator';

class ObjectValidator extends BaseValidator {

    fields = {};

    /**
     * @param {Object} fields
     * @param {String} [defaultMessage]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     */
    constructor(fields, defaultMessage, onError, dependent) {
        super(undefined, defaultMessage, onError, dependent);
        this.fields = fields;
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
