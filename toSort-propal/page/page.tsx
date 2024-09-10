import { Component, h, Prop, Watch, Host, Method, State } from '@stencil/core';
import { Element } from '@stencil/core/internal';
import _ds from '../../../typescript/dot-stash';

export enum AppLocale {
  "EN" = "en-en",
  "FR" = "fr-fr",
}

@Component({
  tag: 'ds-page',
  styleUrl: 'page.scss',
})
export class DSPage {
  CSSClassList: any;

  @Element() container: HTMLDsPageElement;

  @Prop() mods: string | string[] = "";
  @Prop() token: string = "";
  @Prop() locale: AppLocale = AppLocale.FR;
  @Prop() cartUrl: string;

  @State() scrollDisabled = false;

  @Watch('mods')
  modsWatcher( newMods: string | string[] ): void {
    this.CSSClassList = _ds.props.toClassList("ds-page", newMods);
  }

  @Method()
  async disableScroll(): Promise<void> {
    document.querySelector("body").classList.toggle("modal-open");
    this.scrollDisabled = true;
  }
  
  @Method()
  async enableScroll(): Promise<void> {
    document.querySelector("body").classList.toggle("modal-open");
    this.scrollDisabled = false;
  }

  @Method()
  async addToCart(id: string, attributeId: string, attributeGroupId: string, customizationId: string): Promise<void> {
    /* if (this.productParams.isLogged) { */
      let token = '';
      let cartUrl = '';
      const appComponent = document.querySelector("ds-page");
      if (appComponent) {
        ({ token, cartUrl } = appComponent);
      }
  
      const query = `quantity_wanted=1&id_product=${id}&token=${token}&id_customization=${customizationId}&add=1&action=update${attributeGroupId ? `&group[5]=${attributeGroupId}` : ''}`;
  
      try {
        const resp: any = await _ds.ajax.post(cartUrl, query);
        window.prestashop.emit('updateCart', {
          reason: {
            idProduct: resp.id_product,
            idProductAttribute: attributeId,
            idCustomization: resp.id_customization,
            linkAction: 'add-to-cart',
            cart: resp.cart,
          },
          resp,
        });
      } catch( err ) {
        window.prestashop.emit('handleError', {
          eventType: 'addProductToCart',
          err,
        });
      }
    /* } */
  }

  @Method()
  async goTo(url: string): Promise<void> {
    window.location.href = url;
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-page", this.mods);
  }

  componentDidLoad() {
    const {location: { hash }} = window;
    if( hash ) {
      const targetElement = document.querySelector(`[name='${hash.substring(1)}']`) as HTMLElement;
      if(targetElement) {
        const scrollY = targetElement.offsetTop - 50;
        window.scroll(0, scrollY);
      }
    }
    this.container.style.opacity = "1";

    const shopMenuLink = document.querySelector("ds-nav-item[item-id='category-2'] > .ds-nav-item > .ds-nav-item__link > a");
    const allCollectionMenuLink = document.querySelector("ds-nav-item[item-id='category-7'] > .ds-nav-item > .ds-nav-item__link > a");

    if (shopMenuLink && allCollectionMenuLink) {
      shopMenuLink.setAttribute("href", allCollectionMenuLink.getAttribute("href"));
    }

    const isHomePage = this.mods.includes("index");
    if (isHomePage) {
      const marquee =  document.querySelector(".ds-block.--under-slider ds-marquee") as HTMLDsMarqueeElement;

      if (marquee && window.innerWidth < 1440) {
        marquee.speed = 2;
        marquee.pauseOnHover = true;
        marquee.start();
      }

      const videoPlayer = document.querySelector("#content-home iframe") as HTMLIFrameElement;
      if (videoPlayer) {
        videoPlayer.height = `${(window.innerWidth * 758) / 1903}`;
        window.addEventListener("resize", () => videoPlayer.height = `${(window.innerWidth * 758) / 1903}`, { passive: true });
      }

      const instagramVideos = Array.from(document.querySelectorAll(".ybc_instagram_fancy[data-video-src]"));
      instagramVideos.map( video => video.addEventListener("pointermove", () => {
        const videoId = video.getAttribute("data-video-id");
        const videoSrc = video.getAttribute("data-video-src");

        video.closest(".instagram_item_img").innerHTML += `
          <video controls style="display: none; padding: 0; width: auto;"
            id="${videoId}">
            <source src="${videoSrc}" type="video/mp4">
            Your browser doesn't support HTML5 video tag.
          </video>
        `
      }))
    }

    const isCmsPage = this.mods.includes("cms");
    if (isCmsPage) {
      const breadcrumb = document.querySelector(".ds-page__breadcrumb");
      if (breadcrumb) {
        document.querySelector(".elementor-section-wrap .elementor-section-stretched").insertAdjacentElement("afterend", breadcrumb)
      }
    }

    /* const isListingPage = this.mods.includes("category");
    if (isListingPage && window.innerWidth < 768) {
      const categoryDescription = document.querySelector(".ds-product-list-section__description");
      if (categoryDescription) {
        document.querySelector(".ds-category-description-section").insertAdjacentElement("beforebegin", categoryDescription)
      }
    } */

    const faqComponents = Array.from( document.querySelectorAll("ds-heading:has(ds-panel[image])") );
    faqComponents.map( component => {
      const panelTitles = Array.from( component.querySelectorAll("ds-panel[image]") );
      panelTitles.map( panelTitle => panelTitle.addEventListener("click", () => {
        const image = component.querySelector(".ds-heading__image img");
        if (image) {
          image.setAttribute("src", panelTitle.getAttribute("image"));
        }
      }));
    });
  }
  
  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
          "--scroll-disabled": this.scrollDisabled,
        }}
      >
        <ds-rsp>
          <slot />
          <ds-back-to-top-button offset="50" scroll-behavior="smooth" />
        </ds-rsp>
      </Host>
    );
  }
}