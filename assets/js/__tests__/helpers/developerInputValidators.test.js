import {ensureValueIsNumeric, ensureValueIsRegexp} from '../../helpers/developerInputValidators';

test('Test ensureValueIsNumeric throws error on non number value', () => {
    function ensure() {
        ensureValueIsNumeric('banana', 'test', 'testClass', 'num');
    }

    expect(ensure).toThrowError('Cannot add test to testClass: num has to be a number.');
});

test('Test ensureValueIsNumeric does not throw error on number value', () => {
    function ensure() {
        ensureValueIsNumeric(1, 'test', 'testClass', 'num');
    }

    expect(ensure).not.toThrowError();
});

test('Test ensureValueIsRegexp throws error on non regexp value', () => {
    function ensure() {
        ensureValueIsRegexp('banana', 'test', 'testClass', 'expr');
    }

    expect(ensure).toThrowError('Cannot add test to testClass: expr has to be an instance of RegExp.');
});

test('Test ensureValueIsRegexp does not throw error on regexp instance', () => {
    function ensure() {
        ensureValueIsRegexp(/\d+/, 'test', 'testClass', 'expr');
    }

    expect(ensure).not.toThrowError();
});
