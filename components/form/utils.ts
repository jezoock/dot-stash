import { ValidatorType } from "./validator/validator-type.enum";
import { Validator } from "./validator/validator";
import { Greenbox_eventDispatch } from '../../../utils';

/**
 * Determine if the field is required
 * @param {Validator[]} validators
 */
export const isFieldRequired = (validators: Validator[]): boolean => {
  return validators?.length && !!validators?.find((validator: Validator) => validator.type === ValidatorType.REQUIRED);
}

export const notifyFieldsError = (error, messages): void => {
  if (error?.data?.invalidAttributes) {
    const { invalidAttributes } = error.data;
    for (const attr in invalidAttributes) {
      if (invalidAttributes.hasOwnProperty(attr)) {
        const rule = invalidAttributes[attr][0].rule;
        const errorMessage = messages.error[attr] ? messages.error[attr][rule] : messages.error.global;

        Greenbox_eventDispatch(
          ['gbx-input-field'],
          'notify_fieldInError_event',
          { field: attr, errorMessage }
        );

        if (attr === 'password') {
          Greenbox_eventDispatch(
            ['gbx-input-field'],
            'notify_fieldInError_event',
            { field: 'confirmPassword', errorMessage: messages.error['confirmPassword'][rule] }
          );
        }
      }
    }
  }
};
