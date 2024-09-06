import { AnyHTMLElement } from "@stencil/core/internal";

const FIELD_stickySearch = window['FIELD_stickySearch'];
const FIELD_stickyCart = window['FIELD_stickyCart'];
const FIELD_stickyMenu = window['FIELD_stickyMenu'];
const LANG_RTL = window['LANG_RTL'];

const windowResizeHandler = () => {
  handleHeaderPosition();
  handleMobileHeaderPosition();
  handleBackToTopButtonDisplay();
}

const windowScrollHandler = () => {
  handleHeaderPosition();
  handleMobileHeaderPosition();
  handleBackToTopButtonDisplay();
}

const intializeMenu = () => {
  $(".el-main-nav__root-item").each( (_, menu) => {
    let menuInitialized = false;

    $(menu).on("mouseenter", function() {
      if (!menuInitialized) {
        menuInitialized = true;
        $("[data-bg]", $(menu)).each(function(_, el) {
          const layer = $(el);
          layer.css({ backgroundImage: 'url(' + layer.attr("data-bg") + ')' });
        });
      }
    });

  });
}

const initialize = () => {
  window.addEventListener("resize", windowResizeHandler, false);
  window.addEventListener("scroll", windowScrollHandler, false);

  handleHeaderPosition();
  handleMobileHeaderPosition();

  intializeMenu();
}

window.addEventListener("load", initialize);

/* --------- TOOLS ---------- */

const displayMobileMenu = () => $('body').addClass('popup-menu-open');
const hideMobileMenu = () => $('body').removeClass('popup-menu-open');
const backToTop = () => $('html, body').animate({ scrollTop: 0 }, 1000);
const toggleMobileNavItem = (itemId: string) => document.querySelector(`#${itemId}`)?.classList.toggle("--active")

const getScrollTopOffset = () => $(window).scrollTop() || 0;
const getHeaderHeight = () => ($("#header-sticky").height() || 0) + ($(".header-banner").height() || 0) + ($("#_mobile_logo").height() || 0);

const handleBackToTopButtonDisplay = () => {
  const windowScrollTopOffset = getScrollTopOffset();
  const backToTopButton = document.querySelector("ds-trigger.--back-to-top");

  if (backToTopButton) {
    backToTopButton.classList[ windowScrollTopOffset > 50 ? "add" : "remove"]("--shown");
  }
}

const handleHeaderPosition = () => {
  const desktopHeader = document.querySelector("#header-sticky");
  const windowScrollTopOffset = getScrollTopOffset();

  if (desktopHeader) {
    let topHeaderHeight = 0;
    const topHeader = document.querySelector("ds-message") as AnyHTMLElement;
    if (topHeader) {
      topHeaderHeight = topHeader.offsetHeight;
    }
    desktopHeader.classList[ windowScrollTopOffset > topHeaderHeight ? "add" : "remove" ]("sticky-desktop");
  }
}

const handleMobileHeaderPosition = () => {
  const mobileHeader = document.querySelector("#header-mobile");
  const windowScrollTopOffset = getScrollTopOffset();

  if (mobileHeader) {
    mobileHeader.classList[ windowScrollTopOffset > getHeaderHeight() ? "add" : "remove" ]("sticky-mobile");
  }
}

export {};
