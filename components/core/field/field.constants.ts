import { DSFieldLabels } from './field.types';

/** The texts of ds-field (`labels`), in English by default. */
export const DSFieldDefaultLabels: Required<DSFieldLabels> = {
  required: '*',
  showPassword: 'Show password',
  counterRemaining: { one: '{count} character remaining', other: '{count} characters remaining' },
  counterOver: { one: '{count} character over the limit', other: '{count} characters over the limit' },
};

/** The types of `input` a field enhances: the text boxes, and the dates and times. */
export const DS_FIELD_INPUT_TYPES = ['text', 'email', 'number', 'tel', 'url', 'search', 'password', 'date', 'time', 'datetime-local', 'month', 'week'];

/** How long the counter waits after the last input before screen readers are told the count, in ms. */
export const DS_FIELD_COUNTER_DELAY = 1000;
