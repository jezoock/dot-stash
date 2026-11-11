import { Component, Element, h, Host, Prop, State, Watch } from '@stencil/core';
import { toClassList } from '../../utils/props';
import { DS_THUMB_LOADING } from './thumb.constants';
import { DSThumbLoading, DSThumbStatus } from './thumb.types';
import { hueOf, initialsOf, toRatio } from './thumb.utils';

/**
 * A thumbnail: an image of fixed proportions (`ratio`: `2/3` for a poster, `1` for a cover, `16/9` for a still), cropped
 * to fill them, loaded lazily (`loading="lazy"`, `decoding="async"`). Its state is a class: `--loading`, `--loaded`,
 * `--error`. Without a source, or when it fails, a placeholder takes its place: the initials of `label` (one or two
 * letters) on a color of its own, its hue taken from the text (`--ds-thumb-hue`), its saturation and lightness from the
 * theme, so that the initials stay readable.
 *
 * The image is named by `alt` (else by `label`), as the placeholder that replaces it (`role="img"`); `decorative` (or an
 * empty `alt`) leaves both out of the accessibility tree, for a thumbnail next to a text that names it.
 */
@Component({
  tag: 'ds-thumb',
  styleUrl: 'thumb.scss',
})
export class DSThumb {
  @Element() host: HTMLElement;

  /** The URL of the image. Without it, the placeholder. */
  @Prop() src: string;
  /** The candidates of the image for the densities or widths of the screen (`srcset` of the `img`). */
  @Prop() srcset: string;
  /** The widths of the image in the layout, for a `srcset` of widths (`sizes` of the `img`). */
  @Prop() sizes: string;
  /** The text alternative of the image (and of the placeholder). Without it, `label`. An empty `alt` makes it decorative. */
  @Prop() alt: string;
  /** The text the placeholder takes its initials and its color from: the title of the poster, the name of the album. The name of the image without `alt`. */
  @Prop() label: string;
  /** A decorative thumbnail: no text alternative, out of the accessibility tree (a text next to it names the same thing). */
  @Prop() decorative = false;
  /** The proportions, width / height: `2/3`, `16/9`, `1.5`, `1` (`16:9` too). A square by default, and for a value that is not one. */
  @Prop({ reflect: true }) ratio: string = '1';
  /** When the image loads: `lazy` (as it nears the viewport, by default) or `eager` (at once: a thumbnail at the top of the page). */
  @Prop() loading: DSThumbLoading = 'lazy';
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** The state of the image: none, loading, loaded, or failed (the placeholder then shows). */
  @State() status: DSThumbStatus = 'empty';

  private image: HTMLImageElement | undefined;

  @Watch('src')
  @Watch('srcset')
  sourceWatcher() {
    this.status = this.hasSource ? 'loading' : 'empty';
  }

  componentWillLoad() {
    this.sourceWatcher();
  }

  componentDidLoad() {
    this.checkComplete();
  }

  componentDidRender() {
    this.checkComplete();
  }

  /** Whether the thumbnail has a source to load. */
  get hasSource(): boolean {
    return !!(this.src?.trim() || this.srcset?.trim());
  }

  /** Whether it is decorative: `decorative`, or an empty `alt`. */
  get isDecorative(): boolean {
    return !!this.decorative || this.alt === '';
  }

  /** The text alternative: `alt`, else `label`. */
  get name(): string {
    return (this.alt ?? '').trim() || (this.label ?? '').trim();
  }

  /** An image loaded before the component listened (from the cache): its state at once. */
  private checkComplete() {
    const image = this.image;
    // A complete image without a width failed (a broken file), else it loaded. A lazy image that has not started is not complete.
    if (this.status === 'loading' && image?.complete === true && typeof image.naturalWidth === 'number') {
      this.status = image.naturalWidth > 0 ? 'loaded' : 'error';
    }
  }

  private loadHandler = (event: Event) => {
    if (event.target === this.image && this.status === 'loading') {
      this.status = 'loaded';
    }
  };

  private errorHandler = (event: Event) => {
    if (event.target === this.image && this.hasSource) {
      this.status = 'error';
    }
  };

  render() {
    const isDecorative = this.isDecorative;
    const name = this.name;
    const showsImage = this.hasSource && this.status !== 'error';
    const loading = DS_THUMB_LOADING.includes(this.loading) ? this.loading : 'lazy';
    const lang = this.host.closest('[lang]')?.getAttribute('lang') || undefined;
    const initials = initialsOf(this.label || this.alt || '', lang);
    // The placeholder is named as the image, when it has a name; else it is not read.
    const isPlaceholderRead = !isDecorative && !!name;

    return (
      <Host
        class={{
          ...toClassList('ds-thumb', this.mods),
          [`--${this.status === 'empty' ? 'placeholder' : this.status}`]: true,
          '--placeholder': !showsImage,
        }}
        style={{ '--ds-thumb-ratio': toRatio(this.ratio) }}
      >
        {showsImage && (
          <img
            class="ds-thumb__image"
            ref={element => (this.image = element)}
            src={this.src?.trim() || undefined}
            srcset={this.srcset?.trim() || undefined}
            sizes={this.sizes?.trim() || undefined}
            alt={isDecorative ? '' : name}
            loading={loading}
            decoding="async"
            onLoad={this.loadHandler}
            onError={this.errorHandler}
          />
        )}
        {!showsImage && (
          <span
            class="ds-thumb__placeholder"
            role={isPlaceholderRead ? 'img' : undefined}
            aria-label={isPlaceholderRead ? name : undefined}
            aria-hidden={isPlaceholderRead ? undefined : 'true'}
            style={{ '--ds-thumb-hue': String(hueOf(this.label || this.alt || '')) }}
          >
            {initials && (
              <span class="ds-thumb__initials" aria-hidden="true">
                {initials}
              </span>
            )}
          </span>
        )}
      </Host>
    );
  }
}
