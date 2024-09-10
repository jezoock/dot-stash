import { Component, h, Element, Host, Prop, State } from '@stencil/core';
import debounce from '../../../typescript/debounce';
import _ds from '../../../typescript/dot-stash';

interface ProductPage {
  index: number;
  url: string;
  isCurrent: boolean;
}

@Component({
  tag: 'ds-product-list',
  styleUrl: 'product-list.scss'
})
export class DSProductList {

  @Element() hostContainer: HTMLElement;

  @Prop() listUrl: string;
  @Prop() infiniteScroll: boolean;
  @Prop() infiniteScrollDelay: number = 500;

  @State() isLoading: boolean = false;

  pages: ProductPage[] = [];
  pagesCount: number = 0;
  currentPage: ProductPage;

  constructor() {
    this.scrollWatcher = this.scrollWatcher.bind(this);
  }

  connectedCallback() {
    if(this.infiniteScroll) {
      const pagination = document.querySelector(".pronto-pagination");
      if (pagination) {
        const pages = Array.from(pagination.querySelectorAll(".--page"))
          .map(
            (page, index) => {
              const isCurrent = page.classList.contains("--current");
              const pageData = {
                index,
                isCurrent,
                url: page.querySelector("a").getAttribute("href"),
              }
              if (isCurrent) {
                this.currentPage = pageData;
              }
              return pageData;
            }
          );
        this.pages = pages;
      }

      window.addEventListener("scroll", debounce(this.scrollWatcher, this.infiniteScrollDelay), false);
    }
  }

  disconnectedCallback() {
    if(this.infiniteScroll) {
      window.removeEventListener("scroll", debounce(this.scrollWatcher, this.infiniteScrollDelay));
    }
  }

  async scrollWatcher() {
    if (!this.isLoading && this.currentPage?.index < this.pages.length - 1) {
      const pagination = document.querySelector<HTMLElement>(".pronto-pagination");
      const { top: offsetTop } = _ds.tools.getOffset(pagination);

      if(offsetTop + 50 < window.scrollY + window.innerHeight) {
        this.isLoading = true;
        const nextPage = this.pages[ this.currentPage.index + 1 ];
        const nextPageContent = await _ds.ajax.get( nextPage.url, { isAjax: true } );
        const nextPageDocument = (new DOMParser()).parseFromString(nextPageContent, 'text/html');
        const products = Array.from( nextPageDocument.querySelectorAll("#js-product-list ds-product-list ds-grid-item") );
        const listing = this.hostContainer.querySelector(".ds-grid__row");
        products.map( product => listing.append(product));
        this.currentPage = nextPage;
        this.isLoading = false;
      }
    }
  }
  
  render() {
    return (
      <Host class={{
        "ds-product-list": true,
        "--loading": this.isLoading,
      }}>
        <slot />
      </Host>
    );
  }
}