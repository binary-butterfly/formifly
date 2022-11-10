export const ensureValueIsNumeric = (value: any, validatorName: string, className: string, paramName: string) => {
    if (isNaN(value)) {
        throw new Error('Cannot add ' + validatorName + ' to ' + className + ': ' + paramName + ' has to be a number.');
    }
};

export const ensureValueIsRegexp = (value: any, validatorName: string, className: string, paramName: string) => {
    if (!(value instanceof RegExp)) {
        throw Error('Cannot add ' + validatorName + ' to ' + className + ': ' + paramName + ' has to be an instance of RegExp.');
    }
};

export const ensureValueIsDateObject = (value: any, validatorName: string, className: string, paramName: string) => {
    if (!(value instanceof Date)) {
        throw Error('Cannot add ' + validatorName + ' to ' + className + ': ' + paramName + ' has to be an instance of Date.');
    }
};
