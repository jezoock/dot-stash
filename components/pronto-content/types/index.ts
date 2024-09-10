export type AvailablePrestashopHook = 'displayNav' 
  | 'displayProductIntro' 
  | 'displayFooterMessage'
  | 'displayDS_topHeader' 
  | 'displayCmsContent' 
  | 'displaytop' 
  | 'displayBanner'
  | 'displayProductFullDescription'
  | 'displayrightColumn' 
  | 'displayrightColumnProduct' 
  | 'displayleftColumn' 
  | 'displayleftColumnProduct' 
  | 'displayFooterProduct' 
  | 'displayFooter' 
  | 'displayFooterBefore' 
  | 'displayFooterAfter' 
  | 'displayHome';

export const prestashopHooks = [ 'displayProductIntro', 'displayFooterMessage', 'displayBlock', 'displayNav', 'displayDS_topHeader', 'displayBanner', 'displayCmsContent', 'displaytop', 'displayProductFeatures', 'displayProductFullDescription', 'displayrightColumn', 'displayrightColumnProduct', 'displayleftColumn', 'displayleftColumnProduct', 'displayFooterProduct', 'displayFooter', 'displayFooterBefore', 'displayFooterAfter', 'displayHome' ];
export const prestashopPageTypes = [
  {
    value: 'index', 
    label: "Homepage", 
    hooks: prestashopHooks.filter( hook => !['displayBlock', 'displayrightColumnProduct', 'displayleftColumnProduct'].includes(hook) )
  },
  { 
    value: 'category', 
    label: "Category page", 
    hooks: prestashopHooks.filter( hook => !['displayBlock', 'displayrightColumnProduct', 'displayleftColumnProduct', 'displayHome'].includes(hook) )
  },
  { 
    value: 'product',  
    label: "Product page", 
    hooks: prestashopHooks.filter( hook => !['displayBlock', "displayHome"].includes(hook) )
  },
  { 
    value: 'cms',  
    label: "Content page", 
    hooks: prestashopHooks.filter( hook => !['displayBlock', 'displayrightColumnProduct', 'displayleftColumnProduct', 'displayHome'].includes(hook) )
  },
  { 
    value: 'global', 
    label: "Global", 
    hooks: prestashopHooks.filter( hook => hook !== "displayHome" )
  }
];

export const linkedIdAllowedPage = [ 'global', 'category', 'product', 'cms' ];

export const availableComponents = [
  {
    "name": "Image with text",
    "type": "txt-img"
  },
  {
    "name": "Scrolling message",
    "type": "marquee"
  },
  {
    "name": "Slider",
    "type": "slider"
  },
  {
    "name": "Features",
    "type": "features"
  },
  {
    "name": "Product page",
    "type": "product-page"
  },
  {
    "name": "Products block",
    "type": "products-block"
  },
  /* {
    "name": "",
    "type": ""
  }, */
];