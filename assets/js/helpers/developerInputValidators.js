export const ensureValueIsNumeric = (value, validatorName, className, paramName) => {
    if (isNaN(value)) {
        throw new Error('Cannot add ' + validatorName + ' to ' + className + ': ' + paramName + ' has to be a number.');
    }
};

export const ensureValueIsRegexp = (value, validatorName, className, paramName) => {
    if (!(value instanceof RegExp)) {
        throw Error('Cannot add ' + validatorName + ' to ' + className + ': ' + paramName + ' has to be an instance of RegExp.');
    }
};
