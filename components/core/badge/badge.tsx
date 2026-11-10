import { Component, Element, h, Host, Prop } from '@stencil/core';
import { formatLabel, formatPluralLabel, PluralLabel } from '../../utils/labels';
import { toClassList } from '../../utils/props';
import { DS_BADGE_TYPES } from './badge.constants';
import { DSBadgeType } from './badge.types';

/** A number of a prop given as an attribute or a property, `undefined` when it is not one. */
const toCount = (value: number | string | undefined | null): number | undefined => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

/**
 * A small label or count, not interactive: a text (`New`), or a `count` (`3`; `99+` above `max`), in the color of its
 * `type`. `label` gives assistive technologies the text to read instead of the visible one, with the count in it and its
 * plural (`3 unread messages`): the visible text is then `aria-hidden`, the label hidden on the screen. `dot` shows a dot
 * instead of the text, which is then hidden on the screen only. It is not a live region: a page that must tell a change of
 * the count does it with a live region of its own.
 *
 * @slot - The text of the badge (without `count`).
 */
@Component({
  tag: 'ds-badge',
  styleUrl: 'badge.scss',
})
export class DSBadge {
  @Element() host: HTMLElement;

  /** The type of the badge: `neutral` (default), `info`, `success`, `warning` or `error`. Its `--<type>` class: the color of the theme. */
  @Prop({ reflect: true }) type: DSBadgeType = 'neutral';
  /** A count, shown instead of the content: `3`. Above `max`, `<max>+`. */
  @Prop() count: number | string;
  /** The largest count shown: a count above it shows `<max>+` (`99+`), its label the count itself. */
  @Prop() max: number | string;
  /**
   * The text assistive technologies read instead of the visible one, hidden on the screen: `{count}` is the count. One
   * template (`{count} unread messages`), or one per plural category of the language of the badge (its closest `lang`), as
   * JSON: `{"one": "{count} unread message", "other": "{count} unread messages"}`.
   */
  @Prop() label: PluralLabel;
  /** Shows a dot instead of the text: the text (or the label) is hidden on the screen, read by assistive technologies. */
  @Prop({ reflect: true }) dot = false;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** The type, `neutral` for an unknown one. */
  get badgeType(): DSBadgeType {
    return DS_BADGE_TYPES.includes(this.type) ? this.type : 'neutral';
  }

  /** The visible count: the count, or `<max>+` above `max`; `undefined` without a count. */
  get visibleCount(): string | undefined {
    const count = toCount(this.count);
    const max = toCount(this.max);

    if (count === undefined) {
      return undefined;
    }
    return max !== undefined && count > max ? `${max}+` : String(count);
  }

  /** The label, as a template or the templates of the plural categories (a JSON string of them parsed). */
  private get labelTemplate(): PluralLabel | undefined {
    const label = this.label;

    if (typeof label === 'string' && label.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(label);
        return parsed && typeof parsed === 'object' ? parsed : label;
      } catch {
        // A template that starts with a value: `{count} unread messages`.
        return label;
      }
    }
    return label === null || label === '' ? undefined : label;
  }

  /** The text of the label, with the count and the plural of the language of the badge; `undefined` without a label. */
  get labelText(): string | undefined {
    const template = this.labelTemplate;
    const count = toCount(this.count);

    if (template === undefined) {
      return undefined;
    }
    if (count === undefined) {
      return formatLabel(typeof template === 'object' ? template.other : template, {});
    }
    return formatPluralLabel(template, count, this.host.closest('[lang]')?.getAttribute('lang') || undefined);
  }

  render() {
    const count = this.visibleCount;
    const label = this.labelText;

    return (
      <Host
        class={{
          ...toClassList('ds-badge', this.mods),
          [`--${this.badgeType}`]: true,
          '--count': count !== undefined,
          '--dot': !!this.dot,
        }}
      >
        <span class="ds-badge__text" aria-hidden={label !== undefined ? 'true' : undefined}>
          {count !== undefined ? count : <slot />}
        </span>
        {label !== undefined && <span class="ds-badge__label">{label}</span>}
      </Host>
    );
  }
}
