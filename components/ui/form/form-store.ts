import { createStore } from '@stencil/store';

const { state: formContext, onChange: formContextChange } = createStore({
  forms: {},
  values: {} as any,
  validateOn: ['blur', 'change', 'input'],
  eventHandler: (name: string, value: any, formName: string) => {
    const validatedField = {
      [name]: {
        ...formContext.forms[formName].values[name],
        value,
      },
    };

    const validation = processValues(validatedField);

    const newForm = {
      hasError: validation,
      values: {
        ...formContext.forms[formName].values,
        [name]: {
          ...validatedField[name],
          validation,
        },
      },
    };

    formContext.forms = {
      ...formContext.forms,
      [formName]: newForm,
    };

    /* formContext[formName].hasError = validation;
    formContext[formName].values = {
      ...formContext[formName].values,
      [name]: {
        ...formContext[formName].values[name],
        value,
        validation,
      },
    }; */
  },
});

const processValues = fields => {
  let errors = false;
  Object.entries(fields).map(([, { validate, value }]: any[]) => {
    errors = errors || validate(value);
  });
  return errors;
};

export default formContext;
