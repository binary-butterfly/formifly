import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

const resources = {
    en: {
        formifly: {
            array: 'This field has to be an array',
            any_of: 'None of the available validators match',
            required: 'This field is required',
            always_false: 'This validator will never return true',
            greater_than: 'This value must be greater than the value of {{name}}',
            less_than: 'This value must be less than the value of {{name}}',
            greater_or_equal_to: 'This value must be greater than or equal to the value of {{name}}',
            less_or_equal_to: 'This value must be less than or equal to the value of {{name}}',
            greater_than_sibling: 'This value must be greater than the value of its sibling {{name}}',
            less_than_sibling: 'This value must be less than the value of its sibling {{name}}',
            greater_or_equal_to_sibling: 'This value must be greater than or equal to the value of its sibling {{name}}',
            less_or_equal_to_sibling: 'This value must be less than or equal to the value of its sibling {{name}}',
            one_of_array_field_values: 'This value is not allowed.',
            one_of_array_sibling_field_values: 'This value is not allowed.',
            one_of: 'This value must be one of these: {{allowed}}',
            min_length_array: 'There must be at least {{num}} entries for this',
            max_length_array: 'There must be at most {{num}} entries for this',
            length_range_array: 'There must be between {{min}} and {{max}} entries for this',
            boolean: 'This field has to be a boolean',
            custom_email_validator: 'This domain is not allowed',
            date_time: 'This field must contain a date/time',
            min_date: 'This date must be at least {{date}}',
            max_date: 'This date must be {{date}} at the latest',
            date_range: 'This date must be between {{minDate}} and {{maxDate}}',
            greater_than_date: 'This date must be after the value for {{name}}',
            less_than_date: 'This date must be before the value for {{name}}',
            greater_or_equal_to_date: 'This date must be at least the value for {{name}}',
            less_or_equal_to_date: 'This date must be the value of {{name}} at the latest',
            greater_than_sibling_date: 'This date must be after the value for its sibling {{name}}',
            less_than_sibling_date: 'This date must be before the value for its sibling {{name}}',
            greater_or_equal_to_sibling_date: 'This date must be at least the value for its sibling {{name}}',
            less_or_equal_to_sibling_date: 'This date must be the value of its sibling {{name}} at the latest',
            email: 'This must be a valid email address',
            number: 'This field must be a number',
            whole_number: 'This field must be a whole number',
            min_number: 'This value must be at least {{num}}',
            max_number: 'This value must be at most {{num}}',
            positive: 'This value must be positive',
            negative: 'This value must be negative',
            number_range: 'This value must be between {{min}} and {{max}}',
            regex: 'This value is malformed',
            min_length_string: 'This string must be at least {{num}} characters long',
            max_length_string: 'This string must be no longer than {{num}} characters',
            length_range_string: 'This string must be between {{min}} and {{max}} characters long',
        },
    },
};

i18n.use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
