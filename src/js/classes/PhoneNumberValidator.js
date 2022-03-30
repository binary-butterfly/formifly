import StringValidator from './StringValidator';

/**
 * A validator that sets the default input type to "tel" and does nothing else.
 * @extends StringValidator
 */
class PhoneNumberValidator extends StringValidator {
    defaultInputType = 'tel';
}

export default PhoneNumberValidator;
