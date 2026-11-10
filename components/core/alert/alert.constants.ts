import { DSAlertLabels, DSAlertLive, DSAlertType } from './alert.types';

/** The types of ds-alert; another value is `info`. */
export const DS_ALERT_TYPES: DSAlertType[] = ['info', 'success', 'warning', 'error'];

/** The values of `live`; another value is `off`. */
export const DS_ALERT_LIVE_VALUES: DSAlertLive[] = ['off', 'polite', 'assertive'];

/** The texts of ds-alert (`labels`), in English by default. */
export const DSAlertDefaultLabels: Required<DSAlertLabels> = {
  info: 'Information:',
  success: 'Success:',
  warning: 'Warning:',
  error: 'Error:',
  dismiss: 'Dismiss',
};

/**
 * How long a live alert keeps its content from assistive technologies after its live region appears (inserted, shown,
 * made live), in ms. A screen reader announces the changes of a live region it already knows, and a region that comes
 * with its content is not announced reliably. Browsers give the changes of a page to assistive technologies in batches,
 * a few hundred ms apart while the user does not type: the content comes in a later batch than its region.
 */
export const DS_ALERT_LIVE_DELAY = 500;
