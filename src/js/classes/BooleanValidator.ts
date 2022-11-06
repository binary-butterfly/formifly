import PropTypes from 'prop-types';
import BaseValidator, {Dependent, ErrorFunction, InputType, MutationFunction, ValidationResult} from './BaseValidator';

/**
 * A validator that allows you to validate boolean fields.
 * @extends BaseValidator
 */
class BooleanValidator extends BaseValidator {
    protected defaultInputType: InputType = 'checkbox';
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
        mutationFunc?: MutationFunction,
        onError?: ErrorFunction,
        dependent?: Dependent,
        realBool = false,
    ) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);
        this.validateFuncs
            .push([value =>
                (value === true || value === false || value === 'true' || value === 'false')
                    ? String(value)
                    : false, this.defaultErrorMsg]);
        this.realBool = realBool;
    }

    public setRealBool(newRealBool: boolean): void {
        this.realBool = newRealBool;
    }

    public validate(value, otherValues = {}, siblings = {}): ValidationResult {
        const result = super.validate(value, otherValues, siblings);
        if (result[0] && this.realBool) {
            return [result[0], result[1] === 'true'];
        } else {
            return result;
        }
    }
}

export default BooleanValidator;
