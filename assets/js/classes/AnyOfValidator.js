import BaseValidator from './BaseValidator';

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
    constructor(validatorOptions, defaultValue, defaultErrorMsg = 'None of the available validators match', mutationFunc, onError, dependent) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);
        this.validatorOptions = validatorOptions;
    }

    validate(value, otherValues = {}) {
        if (!this.isRequired && !this.validateRequired(value)) {
            return [true, value];
        }

        const preValidate = super.validate(value, otherValues);
        if (!preValidate[0]) {
            return preValidate;
        }

        for (const validatorOption of this.validatorOptions) {
            const test = validatorOption.validate(value, otherValues);
            if (test[0]) {
                if (typeof this.mutationFunc === 'function') {
                    return [true, this.mutationFunc(test[1], otherValues)];
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
