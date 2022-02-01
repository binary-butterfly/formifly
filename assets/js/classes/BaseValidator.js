class BaseValidator {
    validateFuncs = [];
    isRequired = false;

    validateRequired(value) {
        return (value !== '' && value !== null && value !== undefined);
    }

    required() {
        this.isRequired = true;
        this.validateFuncs.push(this.validateRequired);
        return this;
    }

    validate(value) {
        for (const func of this.validateFuncs) {
            if (!this.isRequired && !this.validateRequired(value)) {
                // Skip validation for empty value if required is false
                continue;
            }

            const test = func(value);
            if (test === false) {
                return [false, value];
            } else if (test !== true) {
                // Allows validators to modify the value
                value = test;
            }
        }
        return [true, value];
    }
}

export default BaseValidator;
