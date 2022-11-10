import PropTypes from 'prop-types';
import BaseValidator from './BaseValidator';
import {Dependent, ErrorFunction, InputType, MutationFunction, ValidationResult, ValueType} from '../types';

/**
 * A validator that allows you to validate boolean fields.
 * @extends BaseValidator
 */
class BooleanValidator extends BaseValidator<boolean | string> {
    public defaultInputType: InputType = 'checkbox';
    protected propType = PropTypes.bool;
    private realBool: boolean;

    /**
     * Validate a boolean field
     * @param {Boolean} [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array} [dependent]
     * @param {Boolean} [realBool]
     */
    constructor(
        defaultValue = false,
        defaultErrorMsg = 'This field has to be a boolean',
        mutationFunc?: MutationFunction<boolean | string>,
        onError?: ErrorFunction,
        dependent?: Dependent,
        realBool = false,
    ) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);
        this.validateFuncs
            .push(value =>
                ({
                    success: (value === true || value === false || value === 'true' || value === 'false'),
                    errorMsg: defaultErrorMsg,
                    changedValue: (value === 'true' || value === true),
                }));
        this.realBool = realBool;
    }

    public setRealBool(newRealBool: boolean): void {
        this.realBool = newRealBool;
    }

    public validate(
        value: boolean | string,
        otherValues: ValueType = {},
        siblings: ValueType = {}
    ): ValidationResult<boolean | string> {
        const result = super.validate(value, otherValues, siblings);
        if (result[0] && this.realBool || !result[0]) {
            return result;
        } else {
            return [result[0], result[1] ? 'true' : 'false'];
        }
    }
}

export default BooleanValidator;
