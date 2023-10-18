import { Validators } from "./validators";
import { Validator } from "./validator";

export class FormValidator {
  /**
   * Validates a field based on one or more validator(s)
   * @param validators
   * @param inputValue
   * @return {Validator|null}
   */
  static validate(inputValue: any, validators: Validator[]): Validator | null {
    return validators.find((validator: Validator) => {
      return !Validators[validator.type]({ value: inputValue, argument: validator.argument });
    });
  }

  /**
   * Return the error message :
   * 1. Either from the translations of the component that implements the form field
   * 2. Either from the translations of the form field component if no error message is sent from the component that implements the field
   * 3. A default error message as a last resort, but should never be displayed
   *
   * Note : The value "Invalid Input" is a default error message displayed if no error message has been submitted,
   * but it should never be displayed on the interface
   *
   * @param {ValidatorType} validatorType
   * @param {Validator[]} validators
   * @param {object} defaultErrors  Default errors for the form field, used if no specific errors was send from the component
   * @return {string} the error message (or null if no error key)
   */
  static getErrorMessage({ validatorType = null, validators = [], defaultErrors = {} }): string {
    if (validatorType && validators.length) {
      const errorConfiguration = validators.find((validator: Validator) => validator.type === validatorType);
      return errorConfiguration?.errorMessage || defaultErrors[validatorType] || "Invalid input";
    }

    return null;
  }
}
