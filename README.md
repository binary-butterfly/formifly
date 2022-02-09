# Formifly

***React form handling as light as a butterfly***

Formifly is a library that makes Form handling and frontend input validation a breeze.  
Developed as a replacement for existing Form handling libraries, Formifly was built for performance and ease of integration with existing
REST backends.

It is currently in very early development and not actually usable yet.

## Table of contents

<nav>
<ol>
  <li>
    <a href="#react-components">React Components</a>
    <ul>
      <li><a href="#formiflyform">FormiflyFrom</a></li>
      <li><a href="#automagicformiflyfield">AutomagicFormiflyField</a></li>
      <li><a href="#formiflyfield">FormiflyField</a></li>
      <li><a href="#formiflyselectfield">FormiflySelectField</a></li>
      <li><a href="#formiflycheckfield">FormiflyCheckField</a></li>
      <li><a href="#withlabelerrorsandhelp">withLabelErrorsAndHelp</a></li>
      <li><a href="#formiflyfieldcontainer">FormiflyFieldContainer</a></li>
      <li><a href="#formiflyinput">FormiflyInput</a></li>
      <li><a href="#formiflyinputlabel">FormiflyInputLabel</a></li>
      <li><a href="#formiflyerrorspan">FormiflyErrorSpan</a></li>
      <li><a href="#formiflyhelpspan">FormiflyHelpSpan</a></li>
      <li><a href="#formiflyprovider">FormiflyProvider</a></li>
    </ul>
  </li>
  <li><a href="#styling">Styling</a></li>
  <li>
    <a href="#available-validators">Available Validators</a>
    <ul>
      <li><a href="#basevalidator">BaseValidator</a></li>
      <li><a href="#numbervalidator">NumberValidator</a></li>
      <li><a href="#strigvalidtor">StringValidator</a></li>
      <li><a href="#datetimevalidator">DateTimeValidator</a></li>
      <li><a href="#booleanvalidator">BooleanValidator</a></li>
      <li><a href="#objectvalidator">ObjectValidator</a></li>
      <li><a href="#arrayvalidator">ArrayValidator</a></li>
    </ul>
  </li>
  <li><a href="#cross-dependent-fields">Cross Dependent Fields</a></li>
  <li><a href="#development">Development</a></li>
</ol>
</nav>

## React Components

### FormiflyForm

This component should always be the one containing all of your Fields in one specific form.  
It accepts the following params:

- `onSubmit`: your custom submit handler  
  This has to return a promise that resolves when the form was submitted correctly.  
  Field validation is handled automatically before running your function.  
  If you have additional server validation that does not exactly match the client validators, you can reject the promise in case of an
  error with an object that contains the validation errors for failed fields.  
  If the promise is rejected with anything that is ___not___ formed in this way, the reason will be saved to `submitFailureReason`
  in the Formifly Context.
- `shape`: your validators  
  This has to be an `ObjectValidator` containing all fields in your form.
- `defaultValues`: default values for your form fields (optional)
  This should only be used for a form that is used to edit existing database entries since the validators themselves are also capable of
  holding default values, which is the preferred way to set those.  
  Note that when this param is set, you will have to set **all** of the field values in it.

### AutomagicFormiflyField

This is a component that automatically fetches all field props from the current Formifly Context and decides which exact field component
will be rendered.  
The component can only be rendered from within a Formifly Context, while the other components may also be used outside one if that's
something you need to do.  
When using Formifly fields within a context, using this component is generally the preferred way to do so, although using the field
components directly may lead to a very minor performance increase.

The Component accepts the following props:

- `label` The input label
- `name` The name of the input  
  If this name is the child of an object or array, write like this: `parent.key.subKey`
- `help` Additional help text for the input (optional)  
  Especially useful for fields that do not explain themselves from the label alone or password fields with special requirements.  
  When using the help param, `aria-describedby` will be set correctly automatically.
- `type` The type of the input (optional)  
  Generally type can be inferred from the kind of validator you are using for the field.  
  If the inferred type is incorrect, set it explicitly using this param.
- `id` The id for the input (optional)
  If this is not set, an id will be generated automatically like this: `formifly-input-field-$name`
- `className` A string of classes to apply to the container of the label, input, error and help text (optional)  
  All containers will already have the class names `formifly-field-container` and `formifly-$type-field-container`
- `inputClassName` A string of classes to apply to the input component (optional)    
  All input components will already have the class names `formifly-field-input` and `formifly-$type-field-input`.  
  This will also apply to select fields.
- `labelClassName` A string of classes to apply to the label component (optional)  
  All label components will already have the class names `formifly-field-label` and `formifly-$type-field-label`.
- `helpClassName` A string of classes to apply to the help component (optional)  
  All help components will already have the class names `formifly-field-help` and `formifly-$type-field-help`.
- `errorClassName` A string of classes to apply to the error component (optional)  
  All error components will already have the class names `formifly-field-error` and `formifly-$type-field-error`.
- `conatinerComponent` A component to replace the default container component with (optional)  
  This is useful when you're styling the components using `styled-components`
- `labelComponent` A component to replace the default label component with (optional)
- `inputComponent` A component to replace the default input component with (optional)  
  This is also used for select fields.
- `errorComponent` A component to replace the default error component with (optional)
- `helpComponent` A component to replace the default help component with (optional)
- `optionComponent` A component to replace the default option component in select fields with (optional)
- `labelNoMove` Disable the effect that moves the labels into the input field's border by setting this to true (optional)
- `options` An array of options for select fields  (required for select fields, must not be set for others)  
  This array must contain the options as objects with the keys `label` and `value`.

### FormiflyField

The field component used for most inputs. It accepts the same props as `AutomagicFormiflyField`, however it also adds and requires some
more that are not needed for the automagic one.

These are:

- `errors` A string containing all validation errors for a field
- `value` The value of the field
- `onChange` The input's change handler
- `onBlur` The input's blur handler
- `onFocus` The input's focus handler
- `aria-invalid`: Whether the field content is invalid (optional)
- `aria-describedby`: A space seperated list of html ids of components that describe the input (optional)
- `required` Whether or not the field is required (optional)

All of these props can be generated automatically by calling `getFieldProps()` from the FormiflyContext with the name of the input field.

### FormiflySelectField

The field used for selectors.  
It uses the same params as the `FormiflyField`, however it also adds these params:

- `options` An array that contains all the options for the selector as objects with the keys `label` and `value`
- `optionComponent` A component to overwrite the default option component (optional)

These **can not** be generated by calling `getFieldProps()`.

### FormiflyCheckField

The component used for checkboxes and radios.  
It uses the same params as the `FormiflyField`, however instead of `value`, it required `checked`.  
The `getFieldProps()` function of the FormiflyContext already takes care of this for you if you use it.

### withLabelErrorsAndHelp

This higher order component is used internally to add the input label, error display and help field to a field.  
You may use it if you want to build custom fields that look and behave similar to the ones that come with Formifly.

### FormiflyFieldContainer

This is the component used as a container for all parts that make up a Formifly field.  
You may use it as a base for your custom styled container components.

### FormiflyInput

This is the component used internally for text inputs.  
You may use it as a base for your custom styled input components.

### FormiflyInputLabel

This is the component used internally for field labels.  
You may use it as a base for your custom styled label components.

### FormiflyErrorSpan

This is the component used internally to display field errors.  
You may use it as a base for your custom styled error display components.

### FormiflyHelpSpan

This is the component used internally to display additional help text for fields.  
You may use it as a base for your custom styled help display components.

### FormiflyProvider

The provider that holds all the context values.  
You **should not** need to use this component since it is also included in `FormiflyForm` and it is only exported to enable further
customization than what was considered when building the library.  
If you run into an occasion where you need this component, consider adding an issue or PR to add the behaviour you need to the upstream
library.

## Styling

The provided components do not have many styles attached by default.  
This is done so that you do not need to overwrite tons of different styles when adding them to your own designs.

In order to style the components, there are multiple methods available.

- `styled-components`: You may use styled components to overwrite the components used by default.  
  For this it may be useful to import the default components as the base for your own styled ones.  
  Look at the `AutomagicFormiflyField` documentation to find out how.
- `CSS`: All components have class names applied to allow CSS styles to be matched to them.  
  For these names, look at the documentation for the `AutomagicFormiflyField` as it lists all of them.
- `className`: You may use styling libraries other than styled-components that utilize the className property.  
  For more information about this, look at the documentation for the `AutomagicFormiflyField` as it explains how to do that.
- `style` property: You may also use styling libraries that add an inline `style` prop.  
  To do this, override the default components as explained in the `AutomagicFormiflyField` documentation with ones that have your style
  prop applied.  
  Note that directly applying to `style` prop will **not** apply the styles to the field components.

## Available Validators

Generally all validators accept an optional `msg` param.  
This will be used as the error message if validation fails.  
If the validator accepts other values, those should be able to be inserted into custom strings using template keywords.  
Check the specific validators documentation for that.

Most validator constructors accept (at least) the params `dependent` (see [Cross dependent fields](#cross-dependent-fields)
for more info), `defaultErrorMsg` and `defaultValue`.

The former two params are accepted by all validators, while `defaultValue` is not accepted by the `ArrayValidator` and
the `ObjectValidator`
since for those, their children's default values are used instead.

The default error message will be used when validation fails for a validator that does not have its own error message.  
Note that most existing validators ***do*** have their own default error messages, which you will have to overwrite with your own as well.

If you do not set a default value it will be set to a sensible default for the type of field.  
That means most fields will have an empty string as default value, however arrays and objects will have an empty array or object
respectively and booleans will default to false.  
**The defaultValue may only be queried by using `getDefaultValue()` and not by directly accessing it.**

### BaseValidator

This is the validator that all other validators inherit from, so all of its methods are available for the other validators as well.  
All methods (except for validate) can be chained.

Generally, this validator should only be used as a base for new custom validators or as a "last resort" when no other validator is working
for the kind of date you need. (In which cases it is a good idea to build your own custom validator though.)

The validator may be used in code examples within this documentation in cases where the validator that is actually used does not matter.

Available methods:

- `required(msg: [String])` Make the field required. A field that is not required will pass all validators if it is empty.
- `alwaysFalse(msg: [String])` Make the validation always return false. This may be useful when building more complex dependent validators.
- `getDefaultValue()` Return the field's default value.
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

This will validate any positive number and transform it to be a decimal string with two decimal places.

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
 StringValidator().required().minLength(1).maxLength(2).regex(/^[a-z]+$/);  
```

This will validate any string that is composed of either 1 or two lowercase characters.

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
new DateTimeValidator().minDate(new Date(2020, 1, 1));
```

This will validate any date after the first of february 2020.

### BooleanValidator

This validator is used for boolean values, such as checkbox checked states. It does not have any special functions.

The BooleanValidator will turn any input into a string representation of the correct boolean and fail on values that are not either a
string representation of true or false or a real boolean.

Example:

```js
new BooleanValidator()
```

This example will validate to true for `true`, `false`, `"true"` and `"false"` and return an error message for everything else.

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

This will validate the child fields `foo` and `number` with a String- and NumberValidator respectively.

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

This will validate any child fields of the Array as Strings while also making sure there are at least two children.

## Cross Dependent Fields

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

## Development

In order to work on this library, follow these steps:

1. Pull this repo
2. Install all dependencies: `npm install`
3. Start the development server with the example app: `npm run start`  
   This will automatically open your default web browser with the demo app.
4. Before you push any changes
    1. Run tests and create coverage: `npm run coverage`
    2. Fix any tests that fail
    3. Check the test coverage output and make sure all of your additions are covered where that makes sense
