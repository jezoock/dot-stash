import { parsePhoneNumberFromString } from "libphonenumber-js";
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrAfter);

interface ValidatorConfig {
  /**
   * The value
   */
  value: any,
  /**
   * The compared value
   */
  argument?: any
}

/**
 * This class define a list of validators and their implementation.
 * If you add a validator, dont forget to add the type in the validator-type.enum.ts
 */
export class Validators {
  /**
   * Return if the value is defined
   * @param {ValidatorConfig} config
   * @return {boolean}
   */
  static required(config: ValidatorConfig): boolean {
    return !!config?.value;
  }

  /**
   * Return if the value is a valid email.
   * @param {ValidatorConfig} config
   * @return {boolean}
   */
  static email(config: ValidatorConfig): boolean {
    return /\S+@\S+\.\S+/.test(config?.value);
  }

  /**
   * Return if the phone number is valid
   * @param {ValidatorConfig} config
   * @return {boolean}
   */
  static phoneNumber(config: ValidatorConfig): boolean {
    return parsePhoneNumberFromString(config?.value).isValid();
  }

  /**
   * Return if the value
   * @param {ValidatorConfig} config  'argument' should be the min length
   * @return {boolean}
   */
  static minLength(config: ValidatorConfig): boolean {
    return config && config.argument <= config.value?.length;
  }

  /**
   * Return if the value
   * @param {ValidatorConfig} config  'argument' should be the max length
   * @return {boolean}
   */
  static maxLength(config: ValidatorConfig): boolean {
    return config && config.argument >= config.value?.length;
  }

  /**
   * Return if the value
   * @param {ValidatorConfig} config  'argument' should be the compared value
   * @return {boolean}
   */
  static isSame(config: ValidatorConfig): boolean {
    return config?.value === config?.argument;
  }

  /**
   * Return if the value is a valid date
   * @param {ValidatorConfig} config  'argument' should be the compared value
   * @return {boolean}
   */
  static date(config: ValidatorConfig): boolean {
    return config?.value && dayjs(config.value).isValid();
  }

  /**
   * Return if the value is same or after the argument date. (Ex of use : min age value)
   * @param {ValidatorConfig} config  'argument' should be the compared value
   * @return {boolean}
   */
  static isSameOrAfterDate(config: ValidatorConfig): boolean {
    return config && !dayjs(config.value).isSameOrAfter(config.argument, 'year')
  }
}
