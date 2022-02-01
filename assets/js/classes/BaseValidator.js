class BaseValidator {
    validateFuncs = [];
    isRequired = false;
    defaultErrorMsg = '';

    constructor(defaultErrorMsg = null) {
        this.defaultErrorMsg = defaultErrorMsg ?? 'There is an error within this field';
    }

    validateRequired(value) {
        return (value !== '' && value !== null && value !== undefined);
    }

    required(msg = 'This field is required') {
        this.isRequired = true;
        this.validateFuncs.push([this.validateRequired, msg]);
        return this;
    }

    validate(value) {
        for (const entry of this.validateFuncs) {
            if (!this.isRequired && !this.validateRequired(value)) {
                // Skip validation for empty value if required is false
                continue;
            }

            const func = entry[0]
            const test = func(value);
            if (test === false) {
                return [false, entry[1] ?? this.defaultErrorMsg];
            } else if (test !== true) {
                // Allows validators to modify the value
                value = test;
            }
        }
        return [true, value];
    }
}

export default BaseValidator;
