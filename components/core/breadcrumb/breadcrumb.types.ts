import { PluralLabel } from '../../utils/labels';

/** The texts of ds-breadcrumb (its `labels` prop), to translate them. The name of the landmark is its `label` prop. */
export interface DSBreadcrumbLabels {
  /**
   * The name of the button of a collapsed trail, which shows its hidden levels: `Show full path`. `{count}` is the number
   * of hidden levels: one template, or one per plural category of the language (`{"one": "Show {count} more level",
   * "other": "Show {count} more levels"}`).
   */
  expand?: PluralLabel;
}
