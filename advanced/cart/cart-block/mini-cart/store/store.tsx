import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'ds-mini-cart-store',
  styleUrl: 'store.scss'
})
export class DSMiniCartStore {
  
  @Prop() store: any = {};

  hasLogo = false;

  componentWillLoad() {
    this.hasLogo = Boolean(this.store.fullLogoUrl);
  }

  splitStoreName(): string[] {
    if (this.store.name) {
      const storeName: string = this.store.name;
      const words = storeName.split(/ +/);
      const firstThreeWords = words.slice(0, 3);

      let firstThreeWordsTotalLength = firstThreeWords.reduce((totalLetterCount, word) => {
        return totalLetterCount + word.length;
      }, 0);

      if (this.store.type === "grocery") {
        firstThreeWordsTotalLength += 6;
      }

      let firstLine = [], secondLine = [];
      
      if (firstThreeWordsTotalLength > 20) {
        firstLine = words.slice(0, 2);
        secondLine = words.slice(2, words.length);
      } else {
        firstLine = words.slice(0, 3);
        secondLine = words.slice(3, words.length);
      }

      return [firstLine.join(' '), secondLine.join(' ')];
    } else {
      return ['', ''];
    }
  }

  render() {
    const { name, fullUrl, fullLogoUrl } = this.store;
    const [ shopNameStart, shopNameEnd ] = this.splitStoreName();

    return (
      <a
        class="ds-mini-cart-store"
        href={fullUrl}
      >
        <span class={{
          'ds-mini-cart-store__logo': true,
          '--pink-placeholder': !this.hasLogo
        }}>
          {this.hasLogo && (
            <img
              src={fullLogoUrl}
              alt={name}
            />
          )}
        </span>
        <div class="ds-mini-cart-store__name">
          <div class="ds-mini-cart-store__name-first-part">{shopNameStart}</div>
          {shopNameEnd && (
            <div class="ds-mini-cart-store__name-second-part">{shopNameEnd}</div>
          )}
        </div>
      </a>
    );
  }
}