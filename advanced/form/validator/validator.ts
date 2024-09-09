import { ValidatorType } from "./validator-type.enum";

export interface Validator {
  type: ValidatorType;
  errorMessage?: string;
  argument?: any;
}
