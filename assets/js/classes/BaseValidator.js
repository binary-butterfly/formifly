class BaseValidator {
    validateFuncs = [];

    required() {
        this.validateFuncs.push((value) => (value !== '' && value !== null && value !== undefined));
        return this;
    }

    validate(value) {
        for (const func of this.validateFuncs) {
            if (func(value) === false) {
                return false;
            }
        }
        return true;
    }
}

export default BaseValidator;
