# Formifly

***React form handling as light as a butterfly***

Formifly is a library that makes Form handling and frontend input validation a breeze.  
Developed as a replacement for existing Form handling libraries, Formifly was built for performance and ease of integration with existing
REST backends.

It is currently in very early development and not actually usable yet.

## Available Validators

Generally all validators accept an optional `msg` param.  
This will be used as the error message if validation fails.  
If the validator accepts other values, those should be able to be inserted into custom strings using template keywords.  
Check the specific validators documentation for that.

All validator constructors accept (at least) the params `dependent` (see [Cross dependent fields](#cross-dependent-fields)
for more info), `defaultErrorMsg` and `defaultValue`.

The default error message will be used when validation fails for a validator that does not have its own error message.  
Note that most existing validators ***do*** have their own default error messages, which you will have to overwrite with your own as well.

If you do not set a default value it will be set to a sensible default for the type of field.  
That means most fields will have an empty string as default value, however arrays and objects will have an empty array or object
respectively and booleans will default to false.

### BaseValidator

This is the validator that all other validators inherit from, so all of its methods are available for the other validators as well.  
All methods can be chained.

Available methods:

- `required(msg: [String])` Make the field required. A field that is not required will pass all validators if it is empty.
- `alwaysFalse(msg: [String])` Make the validation always return false. This may be useful when building more complex dependent validators.
- `validate(value, [otherValues])` Validate the field.  
  You should not need to use this function. If you do for some reason, pass the field's value as value and
  (if there are dependencies) all other values as otherValues.

### NumberValidator

This Validator is used for numeric input fields.  
In addition to the general constructor params, it also accepts the `wholeNumber` param.  
Set that one to true if you do not want to accept values with decimal places.

Available methods:

- `min(num: Number, msg: [String])` Enforce an (inclusive) minimum value for the field.   
  Use `{{num}}` in your custom error message to include the minimum value in it.
- `max(num: Number, msg: [String])` Enforce an (inclusive) maximum value for the field.  
  Use `{{num}}` in your custom error message to include the maximum value in it.
- `positive(msg: [String])` Only allow positive values for the field. (Excluding 0)
- `negative(msg: [String])` Only allow negative values for this field. (Excluding 0)
- `range(min: Number, max: Number, msg: [String])` Enforce am (inclusive) range for the input.  
  Use `{{min}}` and/ or `{{max}}` to include the minimum or maximum values in it respectively.
- `decimalPlaces(count: Number)` Format the output as a decimal String with the specified amount of decimal places.

Example:

```js
 new NumberValidator().positive().decimalPlaces(2);
```

### StringValidator

This Validator is used for generic strings.

Available methods:

- `regex(expr: RegExp, msg: [String])` Match the input against a custom regular expression.
- `minLength(num: Number, msg: [String])` Enforce a minimum string length.   
  Use `{{num}}` in your custom error message to include the minimum length in it.
- `maxLength(num: Number, msg: [String]` Enforce a maximum string length.  
  Use `{{num}}` in your custom error message to include the maximum length in it.
- `lengthRange(min: Number, max: Number, msg: [String])` Enforce a string length within a range.  
  Use `{{min}}` and/ or `{{max}}` to include the minimum or maximum length in it respectively.

Example:

```js
 StringValidator().required().minLength(1).maxLength(2).regex(/[a-z]/);  
```

### DateTimeValidator

This Validator is used for timestamps - especially those returned by datetime-local input fields.

Available methods:

- `minDate(date: Date, msg: [String])` Enforce a minimum date.  
  Use `{{date}}` in your custom error message to include the minimum date in it.
- `maxDate(date: Date, msg: [String]` Enforce a maximum date.  
  Use `{{date}}` in your custom error message to include the maximum date in it.
- `dateRange(min: Date, max: Date, msg: [String])` Enforce a date within an inclusive range. Use `{{minDate}}` and/ or `{{maxDate}}` to
  include the minimum or maximum date in your custom string respectively.

Example:

```js
new DateTimeValidator().minDate(new Date(2020 - 01 - 01));
```

### BooleanValidator

This validator is used for boolean values, such as checkbox checked states. It does not have any special functions.

The BooleanValidator will turn any input into a string representation of the correct boolean and fail on values that are not either a
string representation of true or false or a real boolean.

Example:

```js
new BooleanValidator()
```

This example will validate to true for `true`, `false`, `"true"` and `"false"`.

### ObjectValidator

This validator is used when your data model is not flat and has objects with keys in it.  
When the validation fails, it will return a dictionary with all the test results for its children in it.

The object validator does not have any special methods.  
However, it has to be constructed with the field's children as the first param.

Example:

```js
new ObjectValidator({
    foo: new StringValidator().required(),
    number: new NumberValidator().required().positive()
});
```

### ArrayValidator

This validator is used when your data model contains multiple of the same fields. When the validation fails, it will return an array with
all the tests results for its children in it.

It has to be constructed with Validator that is used for the field's children as the first param.

Available methods:

- `minLength(num: Number, msg: [String])` Enforce an (inclusive) minimum amount of children.  
  **Note that when this is > 0, the field will be considered required automatically.**  
  Use `{{num}}` to include the minimum amount of children in your custom error string
- `maxLength(num: Number, msg: [String])` Enforce an (inclusive) maximum amount of children.  
  Use `{{num}}` to include the maximum amount of children in your custom error string.
- `lengthRange(min: Number, max: Number, msg: [String])` Enforce an amount of children within an inclusive range.  
  **Note that when `min` is > 0, the field will be considered required automatically.**
  Use `{{min}}` and/ or `{{max}}` to include the minimum and/ or maximum amount of children in your custom error string respectively.

Example:

```js
new ArrayValidator(new StringValidator().required()).minLength(2);
```

## Cross dependent fields

You can use different validators for fields depending on the value of other fields.  
This behaviour is pretty bare bones at the moment and may be subject to change at a later date.

In order to make a field's Validator dependent on another field, pass an array to the `dependent` constructor param.

The first index of that array must contain the name of the field this Validator depends on.  
If the field is part of an object child, write the name with dots as seen in the example below.

The second index of that array must include a function that returns either true or false, depending on the value this field depends on.

The third index of that array must include the validator that is used instead of the default one if the function from the previous index
returns true.

Dependent validators may be chained.

Example:

```js
shape({
    agreement: new BaseValidator([
        'fruit.banana',
        value => value === 'nom!',
        new BaseValidator().required(),
    ]),
    fruit: new ObjectValidator({
        banana: new StringValidator(),
        apple: new StringValidator(),
    })
})
```

This example will make the field `agreement` required if the field `fruit.banana` contains the value `nom!`.
