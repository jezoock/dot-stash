export type MediaUrlType = 'remote' | 'local';
export type MediaType = 'image' | 'video';
export type MediaPosition = 'top' | 'left' | 'under' | 'right' | 'bottom';
export type Product = any;
export type Products = Product[];

export interface MediaProps {
  playsinline?: boolean;
  muted?: boolean;
  loading?: string;
  src?: string;
  sources?: string | string[];
  alt?: string;
  title?: string;
  sizes?: string;
  srcset?: string;
}

export interface Media {
  path?: string[],
  type: MediaType,
  urlType?: MediaUrlType,
  position?: MediaPosition,
  attributes?: MediaProps
}

export const MediaUrlTypes: MediaUrlType[] = ['local', 'remote'];
export const mediaTypes: MediaType[] = [ 'image', 'video' ];
export const inlineMediaPositions: MediaPosition[] = [ "left", "right" ];
export const blockMediaPositions: MediaPosition[] = [ "top", "bottom" ];
export const MediaPositions: MediaPosition[] = [ "top", "left", "under", "right", "bottom" ];

export const ProductsBlockConfig = [
  /* {
    label: "Titre",
    name: "title",
    type: "title",
  }, */
  /* {
    name: "description",
    label: "description",
    type: "html",
  }, */
  {
    name: "media",
    label: "image",
    type: "media",
    positions: MediaPositions,
  },
  {
    name: "products",
    label: "Produits",
    type: "products"
  }
];

export const PanelFormConfig = [
  {
    label: "Titre",
    name: "title",
    type: "title",
  },
  {
    name: "image",
    label: "image",
    type: "media",
    positions: MediaPositions,
  },
  {
    name: "content",
    label: "Contenu",
    type: "html",
  },
];

export const ImageTextConfig = [
  {
    label: "Titre",
    name: "title",
    type: "title",
  },
  {
    label: "Sous-titre",
    name: "subTitle",
    type: "title",
  },
  {
    name: "description",
    label: "Description",
    type: "html",
  },
  {
    name: "mediaLink",
    label: "Lien de l'image",
    type: "text",
  },
  {
    name: "media",
    label: "image",
    type: "media",
    positions: MediaPositions,
  },
  {
    name: "button",
    label: "Bouton",
    type: "button",
  },
];

export const FeatureFormConfig = [
  {
    label: "Titre",
    name: "title",
    type: "title",
  },
  {
    label: "Sous-titre",
    name: "subTitle",
    type: "title",
  },
  {
    name: "description",
    label: "description",
    type: "html",
  },
  {
    name: "image",
    label: "image",
    type: "media",
    positions: MediaPositions
  },
  {
    name: "isMain",
    label: "Element principal ?",
    type: "switch",
  },
];

export const MainFeatureFormConfig = [
  ...FeatureFormConfig
];

export const ProductDetails1Config = [
  {
    name: "active",
    label: "Actif ?",
    type: "switch",
  },
  {
    name: "image",
    label: "image",
    type: "media",
    positions: inlineMediaPositions
  },
  {
    name: "text",
    label: "Texte",
    type: "html",
  },
];

export const ProductDetails2Config = [
  {
    name: "active",
    label: "Actif ?",
    type: "switch",
  },
  {
    name: "image",
    label: "image",
    type: "media",
    positions: inlineMediaPositions
  },
  {
    name: "text",
    label: "Texte",
    type: "html",
  },
];
export const ProductDetails3Config = [
  {
    name: "active",
    label: "Actif ?",
    type: "switch",
  },
  {
    name: "image",
    label: "image",
    type: "media",
    positions: inlineMediaPositions
  },
  {
    name: "text",
    label: "Texte",
    type: "html",
  },
];
export const ProductDetails4Config = [
  {
    name: "active",
    label: "Actif ?",
    type: "switch",
  },
  {
    name: "image",
    label: "image",
    type: "media",
    positions: inlineMediaPositions
  },
  {
    name: "text",
    label: "Texte",
    type: "html",
  },
];

export const ProductUsageConfig = [
  {
    name: "active",
    label: "Actif ?",
    type: "switch",
  },
  {
    label: "Titre",
    name: "title",
    type: "title",
  },
  {
    label: "Elements",
    name: "elements",
    type: "features",
  },
];

export const ProductFeaturesConfig = [
  {
    name: "active",
    label: "Actif ?",
    type: "switch",
  },
  {
    label: "Titre",
    name: "title",
    type: "title",
  },
  {
    name: "image",
    label: "image",
    type: "media",
    positions: inlineMediaPositions
  },
  {
    label: "Elements",
    name: "elements",
    type: "panels",
  },
];

export const ProductFaqConfig = [
  {
    name: "active",
    label: "Actif ?",
    type: "switch",
  },
  {
    name: "image",
    label: "image",
    type: "media",
    positions: inlineMediaPositions
  },
  {
    label: "Titre",
    name: "title",
    type: "title",
  },
  {
    label: "Elements",
    name: "elements",
    type: "panels",
  },
];

export const ProductVideoConfig = [
  {
    name: "active",
    label: "Actif ?",
    type: "switch",
  },
  {
    label: "Vidéo",
    name: "video",
    type: "media",
  },
];

export const ProductPageConfig = [
  {
    label: "Détails produit - part 1",
    name: "product-details-1",
    type: ProductDetails1Config,
  },
  {
    label: "Détails produit - part 2",
    name: "product-details-2",
    type: ProductDetails2Config,
  },
  {
    label: "Détails produit - part 3",
    name: "product-details-3",
    type: ProductDetails2Config,
  },
  {
    label: "Détails produit - part 4",
    name: "product-details-4",
    type: ProductDetails2Config,
  },
  {
    label: "Utilisation",
    name: "product-usage",
    type: ProductUsageConfig,
  },
  {
    label: "Caractéristiques produit",
    name: "product-features",
    type: ProductFeaturesConfig,
  },
  {
    label: "FAQ Produit",
    name: "product-faq",
    type: ProductFaqConfig,
  },
  {
    label: "Vidéo",
    name: "product-video",
    type: ProductVideoConfig,
  },
]