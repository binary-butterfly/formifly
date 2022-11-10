import StringValidator from './StringValidator';
import {InputType} from '../types';

/**
 * A validator that sets the default input type to "tel" and does nothing else.
 * @extends StringValidator
 */
class PhoneNumberValidator extends StringValidator {
    public defaultInputType: InputType = 'tel';
}

export default PhoneNumberValidator;
