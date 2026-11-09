/** The types of ds-alert: the meaning of the message, which its icon, its color and its prefix tell. */
export type DSAlertType = 'info' | 'success' | 'warning' | 'error';

/**
 * Whether ds-alert is a live region: `off` (a message of the page, read where it is), `polite` (a status: `role="status"`,
 * read when the screen reader is idle) or `assertive` (an urgent message: `role="alert"`, read at once).
 */
export type DSAlertLive = 'off' | 'polite' | 'assertive';

/**
 * The texts of ds-alert (its `labels` prop), to translate them. The prefixes are read before the message by assistive
 * technologies (`Error: The payment failed.`), hidden on the screen: the icon and the color tell the type there. `''`
 * leaves a prefix out (a title that already says it).
 */
export interface DSAlertLabels {
  /** The prefix of an `info` alert: `Information:`. */
  info?: string;
  /** The prefix of a `success` alert: `Success:`. */
  success?: string;
  /** The prefix of a `warning` alert: `Warning:`. */
  warning?: string;
  /** The prefix of an `error` alert: `Error:`. */
  error?: string;
  /** The name of the dismiss button (`dismissible`): `Dismiss`. */
  dismiss?: string;
}
