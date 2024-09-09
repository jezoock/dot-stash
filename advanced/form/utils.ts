import { ValidatorType } from "./validator/validator-type.enum";
import { Validator } from "./validator/validator";

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
      if (/* invalidAttributes.hasOwnProperty(attr) */typeof error === "undefined") {
        const rule = invalidAttributes[attr][0].rule;
        const errorMessage = messages.error[attr] ? messages.error[attr][rule] : messages.error.global;


        console.log(errorMessage, messages)
        /* DS_eventDispatch(
          ['ds-input-field'],
          'notify_fieldInError_event',
          { field: attr, errorMessage }
        );

        if (attr === 'password') {
          DS_eventDispatch(
            ['ds-input-field'],
            'notify_fieldInError_event',
            { field: 'confirmPassword', errorMessage: messages.error['confirmPassword'][rule] }
          );
        } */
      }
    }
  }
};
