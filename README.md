# Formifly

***React form handling as light as a butterfly***

[![.github/workflows/test.yml](https://github.com/binary-butterfly/formifly/actions/workflows/test.yml/badge.svg)](https://github.com/binary-butterfly/formifly/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/binary-butterfly/formifly/badge.svg?branch=main)](https://coveralls.io/github/binary-butterfly/formifly?branch=main)

Formifly is a library that makes Form handling and frontend input validation a breeze.  
Developed as a replacement for existing Form handling libraries, Formifly was built for performance and ease of integration with existing
REST backends.

## Table of contents

1. [Quick Start](#quick-start)
    - [Basic Forms](#basic-forms)
    - [Array Forms](#array-forms)
    - [Object Forms](#object-forms)
    - [Custom Components](#custom-components)
2. [Understanding Formifly](#understanding-formifly)
3. [React Components](#react-components)
    - [FormiflyForm](#formiflyform)
    - [AutomagicFormiflyField](#automagicformiflyfield)
    - [FormiflyField](#formiflyfield)
    - [FormiflySelectField](#formiflyselectfield)
    - [FormiflyCheckField](#formiflycheckfield)
    - [FormiflyRadioGroup](#formiflyradiogroup)
    - [withFormifly and useFormiflyContext](#withformifly-and-useformiflycontext)
    - [withLabelsErrorsAndHelp](#withlabelerrorsandhelp)
    - [FormiflyFieldContainer](#formiflyfieldcontainer)
    - [FormiflyInput](#formiflyinput)
    - [FormiflyInputLabel](#formiflyinputlabel)
    - [FormiflyErrorSpan](#formiflyerrorspan)
    - [FormiflyHelpSpan](#formiflyhelpspan)
    - [FormiflyMultiSelectOption](#formiflymultiselectoption)
    - [FormiflyMultiSelectOptionsMenu](#formiflymultiselectoptionsmenu)
    - [FormiflyMultiSelectOptionsAnchor](#formiflymultiselectoptionsanchor)
    - [FormiflyMultiSelectContainer](#formiflymultiselectcontainer)
    - [FormiflyProvider](#formiflyprovider)
4. [Styling](#styling)
5. [Available Validators](#available-validators)
    - [BaseValidator](#basevalidator)
    - [NumberValidator](#numbervalidator)
    - [StringValidator](#stringvalidator)
    - [DateTimeValidator](#datetimevalidator)
    - [DateValidator](#datevalidator)
    - [BooleanValidator](#booleanvalidator)
    - [ObjectValidator](#objectvalidator)
    - [ArrayValidator](#arrayvalidator)
    - [ArrayOrSpecificStringValidator](#arrayorspecificstringvalidator)
    - [AnyOfValidator](#anyofvalidator)
    - [EmailValidator](#emailvalidator)
    - [PhoneNumberValidator](#phonenumbervalidator)
6. [Cross Dependent Fields](#cross-dependent-fields)
7. [Creating your own Validators](#creating-your-own-validators)
8. [Localization](#localization)
9. [Tips and tricks](#tips-and-tricks)
    - [Multi step forms](#multi-step-forms)
    - [Handling backend validation errors](#handling-backend-validation-errors)
    - [Too many constructor params?](#too-many-constructor-params)
    - [Creating empty array entries](#creating-empty-array-entries)
    - [Race condition when setting multiple child fields?](#race-condition-when-setting-multiple-child-fields)
    - [Race condition when validating multiple child fields?](#race-condition-when-validating-multiple-child-fields)
    - [Helper functions exported by Formifly](#helper-functions-exported-by-formifly)
10. [Development](#development)

## Quick Start

### Installation

To install Formifly, simply run `npm install --save formifly` within your project's directory.

### tl;dr

Head over to the [code of the demo form](src/js/components/demo/DemoForm.tsx); it contains at least one example for every kind of input
field this library ships.

### Basic forms

Generally, there are only a few things you will need to know for most use cases.  
First of all, you will need to know how to create the validators you need.

To do so, you will always have to start by creating a new [`ObjectValidator`](#objectvalidator) as a base with your fields as keys.  
A minimal example for a login form could look like this:

```js
const LoginForm = (props) => {
    const shape = new ObjectValidator({
        username: new StringValidator().required('Please enter your username'),
        password: new StringValidator().minLength(8, 'Passwords are at least 8 chars long').required('A password is required to log in'),
        stayLoggedIn: new BooleanValidator(),
    });

    return <FormiflyForm shape={shape} onSubmit={props.handleSubmit}>
        <AutomagicFormiflyField name="username" label="Username"/>
        <AutomagicFormiflyField name="password" label="Password" type="password"/>
        <AutomagicFormiflyField name="stayLoggedIn" label="Stay logged in"/>
        <button type="submit">Log in</button>
    </FormiflyForm>
}
```

In this example, we first create an ObjectValidator with the fields `username`, `password` and `stayLoggedIn`.  
Username is a required text field, just like password. However, a password must be at least 8 characters long. (Although I would advise
against such validation for a login field since you may change your password guidelines at some point and you will still want people to be
able to log in with their old passwords, but I digress.)  
Then lastly there is the Boolean field `stayLoggedIn`.

Now we can look at the components that are being returned.  
Firstly we've got the `FormiflyForm` as a container for everything.  
This component already includes the context provider so everything that is contained within it can get the field values and validators by
using either the `withFormifly` HOC or the `useFormiflyContext` React hook.  
The form requires at least a shape (which is always an ObjectValidator that contains all form fields) and a submission handler.  
You may also pass `defaultValues` if you do not want the default values to be taken from the validators, like in an edit form for
example.  
If you do this, the validator default values will be overridden with the ones you supplied while non supplied values will still be taken
from the validator defaults.  
Further options about the `FormiflyForm` can be found in [its documentation](#formiflyform).

Within the form we have three AutomagicFormiflyFields.  
These are the easiest way you can create input fields since they get most of their properties automatically from the validator that has
their name.  
Since the password field does not use a specific password validator, we have to override its input type to make it a password input instead
of a simple text input.  
For most inputs you do not need more properties than the field name and label, however there are certain cases where one might need more.  
In the case of select inputs or radio groups, you will also have to pass the available options. To find out more about that
see [the AutomagicFormiflyField documentation](#automagicformiflyfield).

The last `AutomagicFormiflyField` included in this example is for our Boolean field.  
It will render a checkbox by default.

At the very last we have a simple `submit` button that will submit the form just like you would use for any regular form.

### Array forms

There are cases where you need multiple entries for similarly formed data.  
You could simply build multiple forms for that but doing so would not scale, especially if your form also contains regular, non array
data.  
Luckily for you, Formifly provides the possibility of rendering array inputs.

A simple example would look like this:

```js
const ShoppingListForm = (props) => {
    const shape = new ObjectValidator({
        store: new StringValidator().required,
        items: new ArrayValidator(
            new ObjectValidator({
                name: new StringValidator().required(),
                purchased: new BooleanValidator().required(),
            })
        ).minLength(1),
    });

    return <FormiflyForm shape={shape} onSubmit={props.handleSubmit}>
        <AutomagicFormiflyField name="store" label="Store"/>
        <ItemsSubForm/>
        <button type="submit">Save</button>
    </FormiflyForm>
}

const ItemsSubForm = withFormifly((props) => {
    const {values, setFieldValue} = props;

    const handleAddClick = () => {
        const newItems = [...values.items, {name: '', purchased: false}];
        setFieldValue('items', newItems);
    };

    const handleRemoveClick = (which) => {
        const newItems = values.items.filter((item, index) => index !== which);
        setFieldValue('items', newItems);
    }

    return <>
        {values.items.map((item, index) => <React.Fragment key={index}>
            <button type="button" onClick={() => handleRemoveClick(index)}>Delete item</button>
            <AutomagicFormiflyField name={"items." + index + ".name"} label="Name"/>
            <AutomagicFormiflyField name={"items." + index + ".purchased"} label="Purchased"/>
        </React.Fragment>)}
        <button type="button" onClick={handleAddClick}>Add another item</button>
    </>
})
```

As you can see, the `ArrayValidator` accepts another validator as its first constructor parameter.  
This validator is then used to validate all child fields.  
In our case, since there are multiple children, we have to use an `ObjectValidator` to hold them.

The `ArrayValidator` has a minimum length of 1.  
This prevents the form from being submitted without any items set.  
This would also has the effect of filling in a child entry with the default values of its validators.

The form rendering itself is rather simple, the only complicated thing about it being that we had to move `ItemsSubForm` to its own
component.  
That had to be done since in order to render the input fields, we need information from the context that is not available in the component
that creates the context.  
This component is wrapped within the `withFormifly` HOC to get access to that information as well as the `setFieldValue` function, which it
uses to add and remove items from the list.

Generally, array child inputs are as easy to create as those for "regular" fields. The only difference being that they need index of the
entry they are for inside their name like seen in the example.

### Object Forms

There are cases where your data structure is more complex than a flat dictionary of values and maybe some arrays.  
For this case, Formifly allows you to create multiple ObjectValidators to hold this complex data.

Doing so could look something like this:

```js
const ComplexForm = (props) => {
    const timeRegex = /^(([0-1][0-9])|(2[0-3])):[0-5][0-9]$/s;
    const shape = new ObjectValidator({
        name: new StringValidator().required(),
        open_hours: new ObjectValidator({
            regular_hours: new ArrayValidator(
                new ObjectValidator({
                    from: new StringValidator().required().regex(timeRegex).lessThanSibling('until'),
                    until: new StringValidator().required().regex(timeRegex).greaterThanSibling('from'),
                })
            ).minLength(7).maxLength(7),
            exceptional_hours: new ArrayValidator(
                new ObjectValidator({
                    from: new DateTimeValidator().required().lessThanSibling('until'),
                    until: new DateTimeValidator().required().greaterThanSibling('from'),
                })
            ),
        }).required(),
    });

    const days = [0, 1, 2, 3, 4, 5, 6];

    return <FormiflyForm shape={shape} onSubmit={props.handleSubmit}>
        <AutomagicFormiflyField name="name" label="Name"/>
        {days.map((day) => <React.Fragment key={"open_hours_regular" + day}>
            <AutomagicFormiflyField name={"open_hours.regular_hours." + day + ".from"} label="From"/>
            <AutomagicFormiflyField name={"open_hours.regular_hours." + day + ".until"} label="Until"/>
        </React.Fragment>)}
        <ExceptionalHoursSubForm/>
    </FormiflyForm>
}

const ExceptionalHoursSubForm = () => {
    const {values, setFieldValue} = useFormiflyContext();

    const handleAdd = () => {
        const newVal = [...values['open_hours']['exceptional_hours'], {from: '', until: ''}];
        setFieldValue('open_hours.exceptional_hours', newVal);
    }

    const handleRemove = (which) => {
        const newVal = values['open_hours']['exceptional_hours'].filter((entry, index) => index !== which);
        setFieldValue('open_hours.exceptional_hours', newVal);
    }

    return <>
        {values['open_hours']['exceptional_hours'].map((entry, index) => <React.Fragment key={"exceptional_hours_entry" + index}>
            <button type="button" onClick={() => handleRemove(index)}>Remove entry</button>
            <AutomagicFormiflyField name={"open_hours.exceptional_hours." + index + ".from"} label="From"/>
            <AutomagicFormiflyField name={"open_hours.exceptional_hours." + index + ".until"} label="Until"/>
        </React.Fragment>)}
        <button type="button" onClick={handleAdd}>Add entry</button>
    </>
}
```

Here we are creating the opening hours for something.  
It has both regular hours, which are always 7 since there are 7 days in a week, as well as exceptional hours.  
The regular hours are simple strings that should contain the time.  
The exceptional hours however must contain full timestamps, using the `datetime-local` input type.  
Both regular hours and exceptional hours have an additional constraint on the `from` and `until` fields to make sure that no open hours end
before they begin.  
To find out more about how this works, read up on [cross dependent fields](#cross-dependent-fields).

Generally, object forms are almost identical to array forms, the only difference being that the key is a string instead of an integer and
that there is no quick and easy way to add additional entries to them.

### Custom components

While formifly provides many ways of [styling the provided components](#styling), that might not be enough for what you want to do with
it.  
For that case, Formifly also provides tools to make your own components work with it.

Most notably, the Formifly context provides the `getFieldProps` function.  
This function can be called with the field name to figure out all the handlers and properties that are required to include the field into
Formifly.  
It also has additional, optional parameters to help you fine tune your components.  
To use this function, simply spread its return value into the props of your component somewhat like this:

```js
// An extremely basic example for how your component may look.
// You should not use this in production.
const CustomFormInput = (props) => {
    return <div>
        <label htmlFor={props.id}>{props.label}</label>
        <input type={props.type} id={props.id} value={props.value} aria-describedby={props['aria-describedby']}
               aria-invalid={props['aria-invalid']} onChange={props.onChange} onFocus={props.onFocus} onBlur={props.onBlur}/>
        <span id={props.id + '-errors'}>{props.errors}</span>
        <span id={props.id + '-help'}>{props.help}</span>
    </div>
}

// [...]

<CustomFormInput {...getFieldProps('cool_field', 'this field is really cool')} label="Cool"/>
```

This will render your component with the correct `value`, `onChange`, `onFocus`, `onBlur`, `aria-describedby`, `id` and `errors` properties
set.  
Since we also put in a help text as the second call parameter, it will also add the `help` property with our text and an additional id (
componentId + "-help") in the `aria-describedby` prop.

You can still overwrite any of the properties returned by `getFieldProps`. Do do so, simply put them after the unpacked return value when
calling your component.

### Changing fields after creating the shape

You can also change or add new fields to the shape after creating it.  
This may be useful in cases where you're creating a shape that is similar for multiple use cases but has some slight differences.

Here's an example on how to do that:

```js
function getShape(isEditing = false) {
    const shape = new ObjectValidator({
        field: new StringValidator(),
    });

    if (isEditing) {
        shape.fields.editingField = new StringValidator().required();
    }

    return shape;
}
```

## Understanding Formifly

Knowing how to use a library is one thing; understanding it is another.  
In this part of the documentation I wanted to give a bit of an overview for the design decisions taken while developing this library.

First of all, the whole library is somewhat built around the `getFieldProps` function that was in some ways stolen from another form
handling library.  
(Although ours is arguably better :p)  
This function returns all properties needed to render a field and have it work with Formifly.  
Do do so, it inspects the current field values, current validation errors, which fields have been touched and the validator for this
specific field.

It is recommended that you use the `AutomagicFormiflyField` wherever possible since it takes care of calling the `getFieldProps` function
with the correct parameters as well as figuring out which component is the correct one to render every specific input.  
To do that, it also takes a look at which Validator is used for the field.  
ArrayValidators only make sense for a multi-select field while BooleanValidators may be used for checkboxes or radios.  
In addition to that, if you pass an array of `options`, we can assume you want either a radio group (which is a more accessible and
semantic way of defining multiple radio inputs) or a select field.  
We don't want to use a text input for those, so we have custom components that are used instead.

Sooner or later you will want to build your own validators.  
When building the library, making this easy was one of the most important priorities.  
Validators are built to be reusable and as generic as possible while still being useful for what they are.  
That is why many validators will allow most inputs by default and only get more strict once you call their constraint functions.  
If you end up calling the same functions over and over, it may be a good idea to build a quick validator that already contains those by
default.

Validators may also be mutators:  
Every step of the validation has the possibility to mutate a value and have that value used for both all later validation steps as well as
submission.  
This is why the order in which you call your constraint functions actually does matter in some cases.  
The mutated value will not, however, be put back into the form values since that might confuse users. (Many users really hate it when form
values change without their input, even if it makes sense for them to do so.)  
Some may say having validators that also mutate values violates the single responsibility principle, and they may be correct.  
However, allowing validators to mutate the values is extremely useful in many cases (like locales that use commas instead of dots for
decimal points) and also improves performance because if you were to run a set of mutators after doing the validation, you would have to go
through the entire set of values again.  
These mutators are also really helpful when you are communicating with a REST api that is more strict when it comes to typing than
JavaScript is.  
Since we do not have integers, floats or decimals in js, we have to use the number type for all of those.  
That can often cause issues that are annoying to fix, which we tried to mitigate by allowing mutations here.

You may be wondering why the components shipped with this library do not look very pretty.  
This is due to the fact that we can never build a single style that would fit every app that people might want to build, so instead of
spending lots of time styling each end every component, we limited styles to a minimum and provided lots of ways for you
to [customize those styles](#styling).  
It is recommended that you do this once and create your own custom components to use in your app.

There are many situations where you need the name of a field. Since the library supports pretty much any data structure, this had to be
done in a way that works for all structures while being understandable and not too verbose.  
That is why we went with something that should look familiar to most people who have worked with object based data before.  
Internally, these names are split at the dots to traverse through the actual data.  
That may not be the most performant way to do that and is subject to change (although the names will definitely stay the same).  
This is why, when working with [dependent fields](#cross-dependent-fields), you should use the sibling selectors wherever possible to
reduce the amount of string operations necessary to retrieve the data for validation.

The validators shipped with this library may be useful in a node.js or deno backend as well, and reusing the same code may be a good idea
to avoid inconsistency in front- and backend validation.  
However, this use case is **not supported** at the moment. While it may work, we simply do not have the time to test it at the moment.

## React Components

### FormiflyForm

This component should always be the one containing all of your Fields in one specific form.  
It accepts the following params:

- `onSubmit` your custom submit handler  
  This has to return a promise that resolves when the form was submitted correctly.  
  Field validation is handled automatically before running your function.  
  If your promise is rejected, the reason will be saved to `submitFailureReason` in the Formifly Context.  
  Your function will be passed the forms values as first argument and the setErrors function as second.  
  The latter is useful when you are receiving validation errors from your backend and want to show those in the form
- `shape` your validators  
  This has to be an `ObjectValidator` containing all fields in your form.
- `defaultValues` default values for your form fields (optional)
  This should only be used for a form that is used to edit existing database entries since the validators themselves are also capable of
  holding default values, which is the preferred way to set those.  
  Note that when this param is set, all fields not set in it will have their initial value taken from their validator.
- `disableNativeRequired` set this to true to disable passing of the `required` property to input fields in the form.  
  This is useful since the browser validation can be a bit annoying, especially with hidden fields as it disables submission (and
  therefore) automatic js validation when the field is empty.  
  Instead of the `required` prop, `aria-required` will be passed to communicate the requirement to screen readers.
- `disableNativeMinMax` set this to true to disable the passing of `min` and `max` properties to input fields in the form.  
  This is once again useful in cases where the browser validation is getting in the way of your JavaScript handlers.
- `onSubmitValidationError` a function to be run when validation prior to running your onSubmit function fails. (Optional)  
  The function will be called with all field errors that have been found.
- `theme` override the default styling of the provided components. (Optional)  
  Available keys:
    - `inputBackgroundColor` Background color for input fields
    - `errorColor` Both border and font color for fields with errors
    - `inputTextColor` Default text color for inputs
    - `inputBorderColor` Default border color for inputs
    - `highlightColor` Background color for highlighted options in multi selects
    - `reduceMotion` Set to `true` or `false` to override the user's prefer-reduced-motion setting and show/ hide animations either way

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
  Note that for radio groups, **you must** set the type to `radio-group`.
- `id` The id for the input (optional)
  If this is not set, an id will be generated automatically like this: `formifly-input-field-$name`  
  Since radio buttons share a single name, their id will be generated like this: `formifly-input-field-$name-radio-$value`.
- `additionalDescribedBy` Additional ids to add to the aria-describedby property of the input (optional)
  This is especially useful for radio groups when you are not using the `radio-group` component since without an additional label, it will
  be unclear to screen reader users what the specific options refer to.
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
- `legendClassName` A string of classes to apply to the legend component of radio groups (optional)  
  All legend components will already have the class name `formifly-fieldset-legend`
- `conatinerComponent` A component to replace the default container component with (optional)  
  This is useful when you're styling the components using `styled-components`
- `labelComponent` A component to replace the default label component with (optional)
- `inputComponent` A component to replace the default input component with (optional)  
  This is also used for select fields.
- `errorComponent` A component to replace the default error component with (optional)
- `helpComponent` A component to replace the default help component with (optional)
- `optionComponent` A component to replace the default option component in select fields with (optional)
- `legendComponent` A component to replace the default legend component in radio group field sets. (optional)
- `labelNoMove` Disable the effect that moves the labels into the input field's border by setting this to true (optional)
- `options` An array of options for select fields and radio groups (required for those fields, must not be set for others)  
  This array must contain the options as objects with the keys `label` and `value`.
- `multiple` When creating a select field, pass this as true to render a multi select field. (optional)

As well as the same params that the [`FormiflyMultiSelectField`](#formiflymultiselectfield) adds.

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

### FormiflyMultiSelectField

This field is used for selectors that allow multiple selections at once.  
It does not use the multi selector that html provides by default since that one does not work too well sadly.

It uses the same params as the `FormiflySelectField`, adding the following ones:

- `selectionDisplayCutoff` The largest amount of selected options to be displayed within the selection anchor (optional)
- `optionClassName` A string of classes to add to the selection options. (optional)
- `selectAllText` The string to display as the text for the select all option.  
  By default, this will be: "Select all".
- `numSelectedText` The string to display when too many options are selected for them to all be displayed. (optional)
  By default, this will be: "{{num}} selected". You may use the `{{num}}` placeholder in your custom strings as well
- `allSelectedText` The string that will be displayed when all options are selected. (optional)  
  By default this will be: "All selected"
- `nothingSelectedText` The string that will be displayed when nothing is selected. (optional)
  By default this will be: "Nothing selected"
- `selectedDisplayComponent` The component to replace the default selection anchor with. (optional)
- `selectedDisplayClassName` A string of class names to apply to the selection anchor. (optional)  
  There will already be the class `formifly-multi-select-display` applied to all selection anchors
- `menuComponent` A component to replace the default menu that holds the options with. (optional)
- `menuClassName` A string of class names to apply to the option menu. (optional)  
  There will already be the class `formifly-multi-select-menu` applied by default.
- `selectContainerComponent` A component to replace the default container that holds the selection anchor and menu with. (optional)
- `selectionContainerClassName` A string of class names to apply to the select container. (optional)  
  There will already be the class `formifly-multi-select-container` applied by default.

### FormiflyCheckField

The component used for checkboxes and radios.  
It uses the same params as the `FormiflyField`, however instead of `value`, it required `checked`.  
The `getFieldProps()` function of the FormiflyContext already takes care of this for you if you use it.

### FormiflyRadioGroup

The component used for radio groups. It uses the same params as the `FormiflyField`, however it also adds these params:

- `options` An array that contains the values and labels for all radio options with the keys `label` and `value`.
- `legendClassName` A string that contains class names to add to the field set legend component that contains the overarching label. (
  optional)
- `legendComponent` A component to replace the fieldset legend component with. (optional)

These **can not** be generated by calling `getFieldProps()`.

### withFormifly and useFormiflyContext

In order to use the Formifly context, you may use either the `withFormifly` higher order component or the `useFormiflyContext`
React hook.

They will return an object containing/ add the following props:

- `shape` The validation schema
- `values` The current values of the form
- `errors` All validation errors that are currently set
- `submitting` A bool that is true while the submission handler is running and false otherwise
- `setSubmitting` A function that lets you set the current submitting state of the form (you probably won't need this)
- `submitSuccess` Whether or not the form has been submitted successfully
- `submitFailureReason` This will be populated with the reason that caused the submission promise to be rejected.  
  Note that this will not contain anything for validation errors and is instead used to hold information about fetch errors and the like.
- `handleSubmit` The submission handler.
- `handleFocus` The focus event handler used by default on input fields
- `handleBlur` The blur event handler used by default on input fields
- `handleChange` The change event handler used by default on most input fields
- `handleCheckChange` The change event listener used by default on checkbox inputs
- `handleRadioChange` The change event listener used by default on radio groups and radio inputs
- `handleMultiSelectChange` The change event listener used by default on multi selects
- `hasErrors` A function that returns if a field has errors when called with the field name. For non-shallow schemas the name will look
  like this: `object.key`.
- `hasBeenTouched` Similar to `hasErrors`, this returns whether the user has touched an input field.
- `setFieldValue` A function that allows you to manually set a field's value.  
  You call this with the field name as first param and the new value as the second one.  
  You can also optionally call this function with an object to override the previous field values as third parameter.  
  This function will return a promise that resolves with all values after the change.  
  Note that this does not trigger field validation.
- `setMultipleFieldValues` A function that allows you to manually set multiple field values at once.  
  You can call it with an array of arrays that contain the field names at the first entry and the new value as the second.  
  You can also optionally call this function with an object to override the previous field values as second parameter.  
  This function returns a promise that resolves with all values after the change.  
  Note that this does not trigger validation.
- `setMultipleFieldValuesAndValidate` Exactly the same as `setMultipleFieldValues` but it does trigger validation of all fields, sets the errors and returns a promise with the validation result
- `validateField` A function that allows you to trigger validation for a specific field by passing its name and optionally, to improve
  performance, the field's value.  
  This function returns a promise that will be resolved with either `true` or `false` depending on if the value is valid.
- `validateMultipleFields` A function that allows you to trigger validation for a specific set of fields by passing their names (and
  optionally values to improve performance) inside an array of arrays.  
  This function returns a promise that will be resolved with either `true` or `false` depending on if all fields passed validation
- `valiadteAll` A function that allows you to trigger validation for all fields within the form.  
  It returns a Promise that will either resolve with potentially mutated field values or reject with the validation errors that occurred.
- `getFieldProps` A function that returns most properties a field might need. (See [FormiflyField](#formiflyfield) for more info on
  this.)  
  This function accepts the following parameters: `name`, `help`, `type`, `value`, `id`, `additionalDescribedBy`.  
  Only the `name` is required, the other parameters are provided to allow you to override the default values used in most cases.

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

### FormiflyMultiSelectOption

This component is used internally to render each option in a multi select.  
You may use it as a base for your custom styled option components.

### FormiflyMultiSelectOptionsMenu

This component is used internally to render the menu that contains the options for a multi select.  
You may use it as a base for your custom styled menu components.

### FormiflyMultiSelectOptionsAnchor

This component is used internally to display the current state of a multi select.  
You may use it as a base for your custom components

### FormiflyMultiSelectContainer

This component is used internally as a container for the multi select anchor and menu.  
You may use it as a base for your custom components.

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

If the only thing you want to change are the colors used by default, you can also pass a `theme` prop to the
`FormiflyForm` component.  
See [its documentation](#formiflyform) for more info on that.

## Available Validators

Generally all validation functions accept an optional `msg` param.  
This will be used as the error message if validation fails.  
If the validator accepts other values, those should be able to be inserted into custom strings using template keywords.  
Check the specific validators documentation for that.

Most validator constructors accept (at least) the params `defaultValue`, `defaultErrorMsg`, `mutationFunc`, `onError` and `dependent`
(see [Cross dependent fields](#cross-dependent-fields) for more info on the last one).

The latter four params are accepted by all validators, while `defaultValue` is not accepted by the `ArrayValidator` and
the `ObjectValidator` since for those, their children's default values are used instead.

If you do not set a default value it will be set to a sensible default for the type of field.  
That means most fields will have an empty string as default value, however arrays and objects will have a default value depending on their
children and, for arrays, their min child count.  
**The defaultValue may only be queried by using `getDefaultValue()` and not by directly accessing it.**

The default error message will be used when validation fails for a validator that does not have its own error message.  
Note that most existing validators ***do*** have their own default error messages, which you will have to overwrite with your own as well.

If set, the `mutationFunc` will be called if validation succeeds with the field's value and `otherValues` passed to the validate
function.  
The field value will be replaced by whatever the mutationFunc returns before handing it off to your submit handler.  
This is useful if you need to reformat the data before sending it to a REST api for example.

The `onError` callback function will be called when validation fails.  
It receives the `value` and `otherValues` params passed to the `validate` function.

### BaseValidator

This is the validator that all other validators inherit from, so all of its methods are available for the other validators as well.  
All methods (except for validate) can be chained.

Generally, this validator should only be used as a base for new custom validators or as a "last resort" when no other validator is working
for the kind of date you need. (In which cases it is a good idea to build your own custom validator though.)

The validator may be used in code examples within this documentation in cases where the validator that is actually used does not matter.

**Important**  
Please read [Cross Dependent Fields](#cross-dependent-fields) before using any of the comparison functions!

Available methods:

- `required(msg: [String])` Make the field required. A field that is not required will pass all validators if it is empty.
- `oneOf(valuues: Array, msg: [String)` Only allow an array of values for this field.
- `greaterThan(name: String, msg: [String])` Enforce this fields value to be greater than the value of another field.
- `lessThan(name: String, msg: [String])` Enforce this fields value to be less than the value of another field.
- `greaterOrEqualTo(name: String, msg: [String])` Enforce this fields value to be greater than or equal to the value of another field.
- `lessOrEqualTo(name: String, msg: [String])` Enforce this fields value to be less than or equal to the value of another field.
- `greaterThanSibling(key: String|Number, msg: [String])` Enforce this fields value to be greater than the value of one of its siblings.
- `lessThanSibling(key: String|Number, msg: [String])` Enforce this fields value to be less than the value of one of its siblings.
- `greaterOrEqualToSibling(key: String|Number, msg: [String])` Enforce this fields value to be greater than or equal to the value of one of
  its siblings.
- `lessOrEqualToSibling(key: String|Number, msg: [String])` Enforce this fields value to be less than or equal to the value of one of its
  siblings.
- `oneOfArrayFieldValues(key: String|Number, checkFn: [function], msg: [String])` Enforce this field's value to be included within an array
  field or check this fields value against the values included in an array field with a custom function
- `oneOfArraySiblingFieldValues(key: String|Number, checkFn: [function], msg: [String])` Enforce this field's value to be included within a
  sibling array field or check this fields value against the values included in a sibling array field with a custom function
- `alwaysFalse(msg: [String])` Make the validation always return false. This may be useful when building more complex dependent validators.
- `getDefaultValue()` Return the field's default value.
- `getPropType()` Returns the validator represented as PropTypes
- `validate(value, [otherValues])` Validate the field.  
  You should not need to use this function. If you do for some reason, pass the field's value as value and
  (if there are dependencies) all other values as otherValues.
- `setDefaultInputType(newDefaultInputType: String)` Sets the default input type for field's that are validated by this validator
- `setDefaultValue(newDefaultValue)` Sets the default value to override the one given in the constructor
- `setDefaultErrorMsg(newDefaultErrorMsg: String)` Sets the default error message to override the one given in the constructor
- `setMutationFunc(newMutationFunc: [function])` Sets the mutation function to override the one given in the constructor
- `setOnError(newOnError: [function])` Sets the onError handler to override the one given in the constructor
- `setDependent(newDependent: [Boolean|Array])` Sets the dependent value used for [dependent validators](#cross-dependent-fields) to
  override the one passed to the constructor

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

Examples:

```js
 new NumberValidator().positive().decimalPlaces(2);
```

This will validate any positive number and transform it to be a decimal string with two decimal places.

```js
  new NumberValidator(true, 1, 'this field only allows for whole numbers');
```

This will validate any whole number and return the error message seen in the example for anything else.  
It will also set 1 as the default value for this field.

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
 new StringValidator('foo')
    .required()
    .minLength(1)
    .maxLength(3)
    .regex(/^[a-z]+$/);  
```

This will validate any string that is composed of between 1 and 3 lowercase characters.  
It will also set the string "foo" as default value.

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

### DateValidator

This Validator is used for date strings - especially those returned by date input fields.

Available methods:

- `minDate(date: string, msg: [string])` Enforce a minimum date.  
  Use `{{date}}` in your custom error message to include the minimum date in it.
- `maxDate(date: string, msg: [string]` Enforce a maximum date.  
  Use `{{date}}` in your custom error message to include the maximum date in it.
- `dateRange(min: Date, max: string, msg: [string])` Enforce a date within an inclusive range.  
  Use `{{minDate}}` and/ or `{{maxDate}}` to include the minimum or maximum date in your custom string respectively.

Example:

```js
new DateValidator().minDate('2020-01-01');
```

This will validate any date after the first of january 2020.  
Note that unlike the DateTimeValidator, it can only be used for date strings formatted as YYYY-mm-dd.

### BooleanValidator

This validator is used for boolean values, such as checkbox checked states. It does not have any special functions.

The BooleanValidator will fail on values that are not either a string representation of true or false or a real boolean.  
You can also set the `realBool` param, either during construction or using the `setRealBool` function to make the validator return a
string representation of the boolean instead.

Example:

```js
const validator = new BooleanValidator();

validator.validate(false);
// returns [true, false]

validator.setRealBool(false);
validator.validate(false);
// returns [true, 'false']
```

This example will validate to true for `true`, `false`, `"true"` and `"false"` and return an error message for everything else.

### ObjectValidator

This validator is used when your data model is not flat and has objects with keys in it.  
When the validation fails, it will return a dictionary with all the test results for its children in it.

The object validator does only has a single special method, which you are unlikely to need. (See below)
However, it has to be constructed with the field's children as the first param.  
It also accepts an additional param `dropEmpty`, which defaults to `true`.  
This value can also be set after constructing using the `setDropEmpty` function on the validator.  
This param defines whether empty values will be dropped before handing them to the forms submit handler.  
It only works on direct children of the specific ObjectValidator so if your data structure contains multiple objects, each ObjectValidator
must have this param set.  
Similarly, there is also the `dropNotInShape` param, which defaults to `false` and can also be set using `setDropNotInShape`.  
If this value is set to true, the validated result will only contain child fields that have been defined.  
This is useful when using data that came from an API to pre fill an edit form if said data contains fields (like edited timestamps) that
are not allowed to be set by a `PATCH` request.  
Like `dropEmpty`, this param only works for direct children and not recursively.

The ObjectValidator accepts an additional parameter for its `getPropType` function.  
If you pass `true` to the function, instead of returning `PropTypes.shape`, it will return an object that you can directly assign as
the `PropTypes` of a component.

In addition to the regular `validate` function, the ObjectValidator also has a `validateWithoutRecursion` function.  
This function allows you to validate all child fields that are neither Array nor ObjectValidators.  
This can be useful if you only need to validate a subset of a form that is split in multiple steps, with those steps being sub fields of
each other.

Note that a non required ObjectValidator field will be treated as required if it has any children that are required.  
To avoid this behaviour and allow empty objects, you may use the `notRequired` method.

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

It has to be constructed with a Validator that is used for the field's children as the first param.  
In addition to the default params, there is an additional `recursiveOnError` constructor param that lets you control if
the `onError` function should be called if contained fields have an error. This is false by default as it is a newly added
feature and enabling it by default would be a breaking API change.

Available methods:

- `minLength(num: Number, msg: [String])` Enforce an (inclusive) minimum amount of children.  
  **Note that when this is > 0, the field will be considered required automatically.**  
  Use `{{num}}` to include the minimum amount of children in your custom error string
- `maxLength(num: Number, msg: [String])` Enforce an (inclusive) maximum amount of children.  
  Use `{{num}}` to include the maximum amount of children in your custom error string.
- `lengthRange(min: Number, max: Number, msg: [String])` Enforce an amount of children within an inclusive range.  
  **Note that when `min` is > 0, the field will be considered required automatically.**  
  Use `{{min}}` and/ or `{{max}}` to include the minimum and/ or maximum amount of children in your custom error string respectively.
- `validateWithoutRecursion(values, otherValues, siblings)` This function allows you to validate the array entries non recursively.  
  Note that it only works on Array and ObjectValidators since other validators are not recursive by design.
- `setRecursiveOnError(newRecursiveOnError)` This function allows you to control if the onError function should be called if contained fields have an error.

Example:

```js
new ArrayValidator(new StringValidator().required()).minLength(2);
```

This will validate any child fields of the Array as Strings while also making sure there are at least two children.

### ArrayOrSpecificStringValidator

This validator is exactly the same as the ArrayValidator but it also allows a specific string to be the value instead of an array.
This is useful when using Formifly validators in combination with another library that may do "weird" things with array field
values such as [butterflyDataFilters](https://github.com/binary-butterfly/butterflyDataFilters).

Example:

```js
new ArrayOrSpecifcStringValidator(new StringValidator(), undefined, undefined, undefined, undefined, '_any');
```

### AnyOfValidator

This validator tries to validate the field value against an array of other validators and validates successfully if any of those match.

It will run all given validators in the order that they have been passed and stop as soon as the first one has matched.  
Keep this in mind when using mutation functions, since those will only run if either they are set on the first validator that matches or if they
are set on the AnyOfValidator itself.

Also keep in mind that any onError callbacks for validators that are run and don't match will still be triggered, so make sure those don't
break anything.

In addition to the regular constructor params, the AnyOfValidator requires an array of validators to be passed as the first constructor
param.

Another thing to keep in mind is that this validator will validate successfully if either it or any of its validators is not required and
the value is empty, so for a required field you will have to set each validator required.

By default, the AnyOfValidator will return a generic error if none of the given validators match.  
You can change this to pass through the validation error of a specific validator by passing its index either as the passThroughErrorIndex 
constructor param or by calling `setPassThroughErrorIndex`.

Since the AnyOfValidator complicates the whole validation process, it makes some features less intuitive to use.  
If you are using a validator option that has child fields, those cannot by default be used within forms since internal functions
cannot find them.  
To work around this, there are the `passThroughOfIndex` and `passThroughFieldsIndex` constructor params. These will clone
a validator option's of (in the case of ArrayValidators) or fields (in the case of ObjectValidators) into the respective
property of the AnyOfValidator.  
You can theoretically combine both if you allow either an array or an object, but you cannot have multiple passed through
of or fields indices.

If you do not set a default value for the AnyOfValidator itself, the default value of it's first allowed validator will be returned 
on `getDefaultValue()` calls.

Example:

```js
    new AnyOfValidator([new NumberValidator().required(), new StringValidator().required()]).required();
```

This validator will validate successfully for both numbers and strings.

Due to the fact that this validator is actually multiple validators in a Trenchcoat, the input type "guessing" will not work properly for
it and always return "text".

If you want to assign a different default input type for your AnyOfValidator, the cleanest way is to create
a [custom validator](#creating-your-own-validators) and set the defaultInputType there like this:

```js
class WeirdPasswordValidator extends AnyOfValidator {
    defaultInputType = 'password';

    constructor(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent) {
        super([new NumberValidator().required(), new StringValidator().required()], defaultValue, defaultErrorMsg, mutationFunc, onError, dependent, 1);
    }
}
```

This has the added benefit that you can hardcode the validator options if you use the validator in multiple places like shown above.  
Note that this example foregoes the passThroughErrorIndex, passThroughOfIndex and passThroughFieldsIndex constructor params as they 
are not needed (or in the case of passThroughErrorIndex static) for this specific AnyOfValidator.  
This may not be the case for your custom validator.

### EmailValidator

This is a very simple validator that only checks if the given string has an @ somewhere within it and sets the default input type
to `email`.  
Other than that it behaves exactly like the [StringValidator](#stringvalidator).

### PhoneNumberValidator

This validator does nothing except set the default input type to `tel`.  
This is done this way since phone numbers look very different around the world and building a validator that does not have any false
positives or negatives is basically impossible.

If you really want to validate phone numbers client side, you should build your own validator.

This validator behaves exactly like the [StringValidator](#stringvalidator).

## Cross Dependent Fields

### Simple comparisons

All Validators come with the comparison functions `greaterThan`, `lessThan`, `greaterOrEqualTo`, `lessOrEqualTo`, `greaterThanSibling`
, `lessThanSibling`, `greaterOrEqualToSibling` and `lessOrEqualToSibling`.

These functions work in essentially the same way. The only differences being that you have to pass a relative name to the sibling
comparison functions and the fact that the non-sibling comparison functions have more potential to be a performance bottleneck.

To illustrate what we mean by relative name, let's look at a simple example:

```js
const shape = new ObjectValidator({
    name: new StringValidator().required(),
    hours: new ArrayValidator(
        new ObjectValidator({
            from: new StringValidator().required().lessThanSibling('until'),
            until: new StringValidator().required().greaterThanSibling('from'),
        }).required(),
    ).required(),
})
```

Here we are comparing the `from` and `until` fields of each entry within the `hours` array to make sure from is never after until.

You should always use the sibling comparison functions, unless you are comparing a field with one that is lower in the data tree.  
For example:

```js
const shape = new ObjectValidator({
    someNumber: new NumberValidator().required().greaterThanSibling('banana.tasty'),
    banana: new ObjectValidator({
        tasty: new NumberValdidator().required().lessThan('someNumber'),
    }).required(),
})
```

As you can see, we used the sibling comparison function for `someNumber`, since `tasty` is a field of its sibling `banana`.  
We could not use the sibling comparison for `tasty` since it is deeper within the tree than `someNumber` is.

### Array comparisons

The validators also have the functions `oneOfArrayFieldValues` and `oneOfArraySiblingFieldValues`. They behave similar
to [simple comparisons](#simple-comparisons) in that one should always use the sibling function if that is possible.  
Their main difference is that they only allow comparison to array fields and that they have an added `checkFn` parameter that allows you to
override the check function that is used by default.

If you do not provide a custom `checkFn` function, the field value will have to be included directly within the array field's value.  
This could be useful for something like this:

```js
const iceCreamShape = new ObjectValidator({
    tastesAvailable: new ArrayValidator(new StringValidator()),
    orders: new ArrayValidator(new ObjectValidator({
        taste: new StringValidator().oneOfArrayFieldValues('tastesAvailable').required(),
        amount: new NumberValidator().positive().required(),
    }))
})
```

This would only allow orders that have selected a taste that was included in tastesAvailable.

However, if our first array is a bit more complex and we want to check a subfield of its entries, we will need the `checkFn`:

```js
const complexIceCreamShape = new ObjectValidator({
    tastesAvailable: new ArrayValidator(new ObjectValidator({
        id: new NumberValidator().required(),
        name: new StringValidator().required(),
        vegan: new BooleanValidator().required()
    })),
    orders: new ArrayValidator(new ObjectValidator({
        taste: new NumberValidator()
            .oneOfArrayFieldValues('tastesAvailable', (compare, value) => {
                for (const taste of compare) {
                    if (taste.id === value) {
                        return true;
                    }
                    return false;
                }
            })
            .required(),
        amount: new NumberValidator().positive().required()
    }))
})
```

This would compare all available tastes' ids and allow orders that have selected one of them.

### Super custom validators

If this is not enough for you, can also use different validators for fields depending on the value of other fields.  
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
new ObjectValidator({
    agreement: new BaseValidator(undefined, undefined, undefined, undefined, [
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

It is also possible to have multiple dependent validators for one field.  
Take this simplified example for validating zip codes for example:

```js
const validator = new BaseValidator();
validator.setDependent([
    [
        ['country', country => country === 'de', new StringValidator().regex(/^\d{5}$/)],
        ['country', country => country === 'us', new StringValidator().regex(/^\d{5}-\d{4}$/, 'no us zip code :(')],
    ],
]);
```

Here, we are passing an array of dependent validators within the first entry of the dependent field.  
What this does is iterate through every single entry to figure out which validator should be used.

As you can see, German zip codes are numeric only, while zip codes in the US are longer and contain a dash.  
We could use one validator that would return true for any valid zip code of any country, but this would get complicated rather quickly.  
Instead, here we specify rules for the countries that we would expect to be entered and validate with the correct ruleset for the country
that the user selected.  
If the user has not selected a country that we wrote a validator for, the generic `BaseValidator` that allows everything will be used.  
This may or may not be the behaviour you want.

## Creating your own validators

This library is written in a way to make is especially easy to write your own validators.  
If your validators inherit from the correct provided ones, even the input type guessing for field components will work out of the box in
most cases.

Creating your own validator is really easy. This is a quick "tl;dr" example for a very simple one:

```ts
class NotTrueValidator extends BooleanValidator {
    constructor(
        defaultValue: boolean | undefined,
        defaultErrorMsg: string,
        mutationFunc?: MutationFunction,
        onError?: ErrorFunction,
        dependent?: Dependent
    ) {
        super(defaultValue, defaultErrorMsg, mutationFunc, onError, dependent);
        this.validateFuncs.push(value => ({
            success: value !== 'true' && value !== true,
            errorMsg: defaultErrorMsg,
            msgName: 'not_true',
            changedValue: Boolean(value),
        }));
    }
}
```

all this does is add a constraint to the existing BooleanValidator to make sure only false is validated as correct.

However, your validators can be a bit more complex.  
Let's imagine an email validator that does not allow email addresses hosted from some specific domain.  
We would write that something like this:

```ts
class CustomEmailValidator extends EmailValidator {
    public defaultInputType: InputType = 'email';

    public notFromDomain(domain: string, msg?: string): this {
        this.validateFuncs.push(
            (value) => {
                const splitString = value.split('@');
                return {success: splitString[splitString.length - 1] !== domain, errorMsg: msg, msgName: 'custom_email_validator'};
            },
        );
        return this;
    }
}
```

This validator does the following things:

- It sets the `defaultInputType` to email so an email input field will be rendered.
- It adds a validator that checks if the input contains an @ at a position that is neither first nor last.  
  (email most likely allows for more things than you think, so it's a good idea to just allow basically everything and catch incorrect
  input by sending validation emails.)
- It adds a function called `notFromDomain`.  
  This function can be used to forbid email addresses hosted on a certain domain.
- It allows the user to set a custom message in case the notFromDomain validator validates to false
    - If no error is given, the translation function will be used to look up a localized string with the key `custom_email_validator`

## Localization

By default, all built in validators will return more or less useful error messages in English language, when they are used within a
FormiflyForm.  
You can override those on a per validator basis by using the defaultErrorMessage property on the validator and the msg property on
validator functions.
Some validator functions even automatically replace the names of their parameters when they are passed a custom string that contains a
placeholder like `{{num}}`.

However, overriding all of these error messages can get very tedious, which is why since version 2, Formifly makes use of the powerful
[react-i18next](https://react.i18next.com/) localization library.  
To automatically localize all included default error messages, you can pass your own translation function to the FormiflyForm.  
In order for this to work, you will need a `formifly` namespace with all the translation strings included
in [our custom i18n.ts](./src/js/helpers/i18n.ts) file.

If the validator takes any parameters, such as `min` for `StringValidator.minLength(min)`, these will be given to the translation function
in an object as the second parameter, to allow automatic replacement of placeholders.

Any custom validators you create must return a msgName that can be used as a translation key on their validation functions.

## Tips and tricks

### Multi step forms

Do you have a multi step form where each step is its own ObjectValidator?  
You can easily check if a step has errors or if any field within the step has been touched using the `hasErrors` and `hasBeenTouched`
function provided by the context.

Example:

```js
const multiStepShape = new ObjectValidator({
    stepOne: new ObjectValidator({
        foo: new StringValidator().required(),
        bar: new StringValidator(),
    }),
    stepTwo: new ObjectValidator({
        username: new StringValidator().required(),
        password: new StringValidator().required(),
    })
});

return <FormiflyForm shape={multiStepShape} onSubmit={() => null}>
    <FormContent/>
</FormiflyForm>

//[..]

const FormContent = (props) => {
    const {hasBeenTouched, hasErrors} = useFormiflyContext();
    const [currentStep, setCurrentStep] = React.useState(0);

    return <SomeStepper currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                        failed={[Boolean(hasErrors('stepOne')), Boolean(hasErrors('stepTwo'))]}
                        touched={[hasBeenTouched('stepOne'), hasBeenTouched('stepTwo')]}>
        {currentStep === 0 && <StepOneForm/> || currentStep === 1 && <StepTwoForm/>}
    </SomeStepper>
}
```

Note that (despite what one might expect from its not especially well chosen name) the `hasErrors` function returns either the error text
or `false` if there are no errors, so you might have to convert its result into a boolean depending on what your stepper expects.  
This library does not provide any stepper functionality on its own, so you will have to build your own or use one from a component library
that you like.

### Handling backend validation errors

Since the validators you define in Formifly are only used in the frontend, your backend validation may return errors when Formifly does
not.  
For this case, Formifly passes its `setErrors` function to your `onSubmit` function as a second argument.

Displaying backend errors from our Python validation library [validataclass](https://github.com/binary-butterfly/validataclass) could look
something like this:

```js
const unpackValidataclassErrors = (error) => {
    let ret = {};
    if (error.code === 'field_errors' || error.code === 'list_item_errors') {
        Object.entries(error.field_errors ?? error.item_errors).map(([key, value]) => {
            ret[key] = unpackValidataclassErrors(value);
        })
    } else {
        ret = error.code;
    }
    return ret;
}

const handleSubmit = (values, setErrors) => {
    return fetch('https://your_rest_backend.invalid.tld', values).then((result) => {
        if (result.status === 400) {
            result.json().then((parsed) => {
                setErrors(unpackValidataclassErrors(parsed));
                return Promise.reject('server side validation');
            });

            //[..]
        }
    })
}
```

This would not make for the most user friendly error messages (since it uses the codes as validation errors directly), so you would
probably want to put those in a localization library but that is out of scope for this documentation.

### Too many constructor params?

The validators accept a wide range of constructor params and due to the fact that keyword arguments are not supported in ES currently, this
can be a bit annoying when you have to pass a bunch of `undefined`s just to set the last one.  
Most constructor params also have their own dedicated setter functions.

These are:

- `setDefaultValue`
- `setDefaultErrorMsg`
- `setMutationFunc`
- `setOnError`
- `setDependent`

### Creating empty array entries

When adding a new entry into an array, you have to insert an empty child into the values for said array.  
You may do this simply by writing down all the values that an empty child would have.  
This does get tedious for large object children and introduces another source of truth, which you probably don't want.  
So, instead of creating an empty child by hand, use the `getDefaultValue` function of the child's validator like this:

```js
// [..]

const shape = new ObjectValidator({
    fruit: new ArrayValidator(new ObjectValidator({
        tasty: new BooleanValidator(true),
        name: new BooleanValidator().isRequired()
    })),
});

<FormiflyForm shape={shape} onSubmit={() => null}>
    <FruitSubForm/>
    {/*[..]*/}
</FormiflyForm>

//[..]

const FruitSubForm = withFormifly((props) => {
    const {values, setFieldValue, shape} = props;

    const handleAddClick = () => {
        setFieldValue('fruit', [...values.fruit, shape.fields.fruit.of.getDefaultValue()]);
    }

    return <>
        {values.fruit.map((fruit, index) => <React.Fragment key={index}>
            <AutomagicFormiflyField name={'fruit.' + index + '.tasty'} label="tasty"/>
            <AutomagicFormiflyField name={'fruit.' + index + '.name'} label="name"/>
        </React.Fragment>)}
        <button onClick={handleAddClick}/>
    </>
});
```

### Race condition when setting multiple child fields?

If you need to set multiple child fields of an object or array validator at once, you may try to do this by running `setFieldValue`
multiple times in a row.  
Sadly, this will not always work as you think since race conditions can occur that will undo the first change you do.  
Instead of running the `setFieldValue` function multiple times, use the `setMultipleFieldValues` function instead and call it with an array
of arrays that describe all changes you want to do.

```js
setMultipleFieldValues([['field1', 'foo'], ['field2', 'bar']]);
```

### Race condition when validating multiple child fields?

The `validateField` function suffers from the same issue as the `setFieldValue` one does.  
So, instead of running it multiple times in a row for child fields, use the `setMultipleFieldValues` function like this:

```js
validateMultipleFields([['field1', 'valueOfField1'], ['field2']]);
```

As you can see, the value is optional, but passing it improves performance of the function.  
In any case, you will have to pass an array of arrays that contain at least the field names as their respective first entries.

### Helper functions exported by Formifly

Formifly exports some helper functions to help you work with it:

- `convertDateObjectToInputString(date: Date)` Converts a date object to a string that can be used as the value for a datetime-local input
  field.
- `getFieldValueFromKeyString(keyString: string|number, values: Value|UnpackedErrors<any>)` Finds a field's value inside the formifly
  values object by the key string.
- `setFieldValueFromKeyString(keyString: string, value: Value, oldValues: T)` Sets a value within an object by its key string.
- `containsValuesThatAreNotFalse(obj: any)` Checks to see if there is a value that is not false inside an object, checking all sub objects
  and arrays. Useful for working with the Formifly `errors` object.
- `findFieldValidatorFromName(name: string, shape?: ObjectValidator<any> | ArrayValidator<any> | BaseValidator<any>)` Finds the validator
  for a specific key string within a shape
- `unpackErrors(currentResult: ValidationResult<ValueOfValidator<T>>)` Turns a validation result into a valid Formifly `errors` object

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

Note that this library follows semantic versioning.  
This means that any changes which change the API in a breaking way can only be merged in mayor updates.  
Minor updates are reserved for added features and patch updates are used for bugfixes and dependency upgrades.

However, what is considered a breaking change of the API is mostly defined by behaviour documented here, not by code itself.  
This means that bug fixes which change the API in a way that makes it conform to this documentation may be allowed in a minor or patch
release.
