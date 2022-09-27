import BaseValidator from './BaseValidator';

/**
 * A "meta" validator that allows you to check if a value can be successfully validated by any of a given list of validators.
 * @extends BaseValidator
 *
 * @property {Array<BaseValidator|AnyOfValidator|ArrayValidator|BooleanValidator|EmailValidator|NumberValidator|ObjectValidator|PhoneNumberValidator|StringValidator>} validatorOptions - The validators that the value is checked against
 */
class AnyOfValidator extends BaseValidator {
    validatorOptions;

    /**
     * Validates something against an array of different validators and returns true if any of them match.
     * @param {Array} validatorOptions
     * @param {Any} [defaultValue]
     * @param {String} [defaultErrorMsg]
     * @param {Function} [mutationFunc]
     * @param {Function} [onError]
     * @param {Array|Boolean} [dependent]
     */
    constructor(
        validatorOptions,
        defaultValue,
        defaultErrorMsg = 'None of the available validators match',
        mutationFunc,
        onError,
        dependent,
    ) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);
        this.validatorOptions = validatorOptions;
    }

    validate(value, otherValues = {}, siblings = {}) {
        if (!this.isRequired && !this.validateRequired(value)) {
            return [true, value];
        }

        const preValidate = super.validate(value, otherValues, siblings);
        if (!preValidate[0]) {
            return preValidate;
        }

        for (const validatorOption of this.validatorOptions) {
            const test = validatorOption.validate(value, otherValues, siblings);
            if (test[0]) {
                if (typeof this.mutationFunc === 'function') {
                    return [true, this.mutationFunc(test[1], otherValues, siblings)];
                }
                return test;
            }
        }

        if (typeof this.onError === 'function') {
            this.onError(value, otherValues);
        }

        return [false, this.defaultErrorMsg];
    }
}

export default AnyOfValidator;
