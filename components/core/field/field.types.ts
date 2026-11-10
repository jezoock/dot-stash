import type { ValidityFlag } from '../../utils/form-control';
import type { PluralLabel } from '../../utils/labels';

/**
 * The texts of ds-field (its `labels` prop), to translate them. A text of the counter is one template, or one template per
 * plural category of the language of the field (its `lang`, or that of the page): `{"one": "…", "other": "…"}`, with the
 * categories of `Intl.PluralRules` (`one`, `few`, `many`, `other`…; `other` is the fallback). `{count}` is a number of
 * characters.
 */
export interface DSFieldLabels {
  /**
   * The mark after the label of a required control, `*`: visible, and hidden from assistive technologies (the control is
   * required: they say it). A text for sighted users instead, `(required)`, or `''` for none.
   */
  required?: string;
  /** The name of the button that shows the password (`aria-pressed` gives its state): `Show password`. */
  showPassword?: string;
  /** The counter within the limit: `{count} character remaining`, `{count} characters remaining`. */
  counterRemaining?: PluralLabel;
  /** The counter over the limit (a value longer than the `maxlength`, set by a script): `{count} character over the limit`… */
  counterOver?: PluralLabel;
}

/**
 * The error messages of ds-field per validity flag (its `messages` prop), instead of the message of the browser:
 * `{"valueMissing": "Enter your email address", "typeMismatch": "Enter an email address, like name@example.com"}`.
 */
export interface DSFieldMessages extends Partial<Record<ValidityFlag, string>> {
  /** A required control left empty. */
  valueMissing?: string;
  /** A value the browser cannot read (letters in a number). */
  badInput?: string;
  /** A value that is not of the type of the control (an email, a URL). */
  typeMismatch?: string;
  /** A value that does not match the `pattern`. */
  patternMismatch?: string;
  /** A value longer than the `maxlength`, or shorter than the `minlength`. */
  tooLong?: string;
  tooShort?: string;
  /** A value below the `min`, or above the `max`. */
  rangeUnderflow?: string;
  rangeOverflow?: string;
  /** A value that is not a step of the `step`. */
  stepMismatch?: string;
}
