import StringValidator from './StringValidator';

class PhoneNumberValidator extends StringValidator {
    defaultInputType = 'tel';
}

export default PhoneNumberValidator;
