# Propal archive (`toSort-propal/`)

## Where the code lives now

`toSort-propal/` (317 files copied from the "Propal" project) was removed from the development branch.
It is preserved, unchanged, on the branch **`archive/propal`** (commit `997b49e`). Nothing is developed on that branch.

```sh
git fetch origin archive/propal

# List the archived files
git ls-tree -r --name-only origin/archive/propal -- toSort-propal

# Read one file without restoring it
git show origin/archive/propal:toSort-propal/grade-star/grade-star.tsx

# Restore a folder into the working tree (it comes back under toSort-propal/)
git checkout origin/archive/propal -- toSort-propal/form/checkbox
```

When recovering a component, move it into `components/core/` (or `components/pronto-content/`), fix its imports,
and do not add `toSort-propal` back to `tsconfig.json`.

## Why it was removed

- It was listed in `tsconfig.json` `include`, so Stencil compiled it with the library.
- `cart/` and `cart-2/` define the same 15 tags, and `form/` redefines `ds-select` (`components/core/select`),
  `ds-input-date` (`components/pronto-content/form`) and `ds-input` (also in `form-store/`).
  `npx stencil build --dev` stopped with 18 "Component Tag Name … Must Be Unique" errors.
- Most of it imports modules that do not exist in this repo: `@stencil/redux`, `redux`, `dayjs`, `jwt-decode`,
  `_redux/*`, `api-types`, `interfaces`, `models/*`, `utils` (`DS_setTranslations`, `DS_formatPrice`,
  `DS_eventDispatch`, …), `ui/*` enums, and components such as `ds-button`, `ds-loader`, `ds-alert`, `ds-snackbar`.
- Imports of `typescript/dot-stash` use relative paths written for a deeper folder and do not resolve.

After removal, the dev build only reports the two known Sass import errors
(`components/demo/global.scss`, `components/pronto-content/pronto-content-admin.scss`).

## Recovery table

**Recover**: generic, worth bringing into the library. **Adapt**: useful idea, needs rework or is tied to
PrestaShop/Propal. **Drop**: Propal business logic.

| Folder | What it is | Missing deps / issues | Overlaps | Recommendation |
| --- | --- | --- | --- | --- |
| `form` | Form controls: `ds-checkbox`, `ds-radio` (+ `ds-radio-item`, `ds-radio-list`), `ds-textarea`, `ds-form-label`, `ds-field-feedback`, `ds-input`, `ds-input-field`, `ds-input-password`, `ds-input-date`, `ds-select`, validators | `ds-button` (password toggle), `ds-input-phone` (input-field); broken `_ds` import path (input, radio); phone/date validators return `false` (`libphonenumber-js`/`dayjs` commented out); error messages are placeholder strings (translations removed); `ds-form` is an empty stub | `select` ↔ `core/select` (same tag); `input/date` ↔ pronto-content `ds-input-date` (same tag; Propal's is a month/year field for card expiry); `input-password` ↔ pronto-content `ds-password`; `checkbox`/`radio` ↔ `core/toggle` (`type` checkbox/radio); `ds-input` ↔ `form-store` | **Recover** checkbox, radio, textarea, label, feedback, input, input-field, validators. Merge select into `core/select` and input-password into `ds-password`. Drop input-date and the `ds-form` stub |
| `back-to-top-button` | Scroll-to-top button shown after an offset (uses `ds-trigger`) | `_ds` import path only | None (theme style in `scss/components/pronto/back-to-top-button.scss`) | **Recover** |
| `grade-star` | 0–5 star rating with partial fill | `_ds` import path; relies on theme `.ds-placeholder --star` classes | Complements `core/rating-list` (its SCSS already styles `ds-grade-star`) | **Recover** |
| `search-bar` | Search input + submit button | `ds-button`; `_ds` import path; PrestaShop params (`controller=search`, `s`) hard-coded; AJAX results commented out | `search` (same purpose) | **Recover**, merged with `search` into one generic component |
| `app-menu` | Responsive menu shell: mobile open/close triggers, `primaryNav`/`secondaryNav` slots | None (uses `ds-trigger`) | Partly `core/nav`, `core/sidebar` | **Recover** |
| `search` | Collapsible search form for the PrestaShop search controller | None | `search-bar` | **Adapt**: merge into `search-bar` |
| `sticky-cart-button` | Wrapper shown after a scroll offset | `_ds` import path | Same scroll logic as `back-to-top-button` | **Adapt**: generic "show on scroll" wrapper |
| `vimeo` | Vimeo iframe lazy-injected on first interaction/scroll or after 2 s | Site-specific iframe title hard-coded; listener added on `document`, removed on `window` | `core/video` (`ds-video`, HTML5 sources only) | **Adapt**: add as an embed option of `ds-video` |
| `form-store` | Prototype form state with `@stencil/store` (`ds-form-context`, `ds-input`) | Prototype quality (debug border, placeholder error text) | `ds-input` tag clash with `form` | **Adapt**: idea for form state handling |
| `page` | `ds-page` app shell: scroll lock, hash scroll, `addToCart` via `window.prestashop`, plus site-specific DOM hacks (nav item IDs, Elementor, Instagram, marquee) | `_ds` import path | None in core, but `typescript/dot-stash.ts` queries `ds-page` at runtime | **Adapt**: minimal generic shell, or remove the `ds-page` dependency from `_ds` |
| `product-list-header` | PrestaShop category header (cover, title, short/long description slots) | Hard-coded French text and `#category-faq` anchor | None (uses `ds-title`, `ds-text`) | **Adapt**: pronto-content candidate |
| `newsletter` | PrestaShop newsletter subscription form (`_ds.ajax.post`) | `ds-button`; hard-coded "S'inscrire"; Smarty leftover `{$hookName}` | None | **Adapt** |
| `address` | Address autocomplete (Pelias geocoder), dropdown, selector, search, display | `@stencil/redux`, `dayjs`, `_redux/*`, `models/address`, `utils` (`DS_uuid`, `DS_getAppLocale`), `ds-notification` | None | **Adapt** `address-autocomplete` only (`DS_uuid` → `typescript/uuid.ts`); drop the rest |
| `account` | Customer account: orders and order details, profile, addresses, credit cards, password change, vouchers, wallet, account validation | `@stencil/redux`, `dayjs`, `js-cookie`, `_redux/*`, `utils`, `interfaces`, `ui/*` enums, `DS_*` helpers, Google Ads globals, `ds-alert`, `ds-button`, `ds-loader`, … | None | **Drop** |
| `auth-container` | Login, register, reset password, B2B success/failure flows | `@stencil/redux`, `redux`, `jwt-decode`, `js-cookie`, reCAPTCHA, `_redux/*`, `utils`, `DS_*` helpers, `ds-cgu`, `ds-button`, … | None | **Drop** |
| `cart` | Cart block, mini-cart, items, summary, click-and-collect, store notes, confirm modal | `api-types`, `_redux/*`, `utils`, `ui/*` enums, `DS_*` helpers, `ds-button`, `ds-loader`, `ds-snackbar`, `ds-product-input-quantity`, `ds-cart-deadline` | `ds-confirm-modal` ↔ `core/modal` | **Drop** |
| `cart-2` | Near-duplicate of `cart` (10 files differ, all 15 tags clash) | Same as `cart` | `cart` | **Drop** |
| `shopping-bag` | No source code: only generated readmes and 3 SCSS files | — | None | **Drop** |

## Follow-ups (not changed here)

- **`components/components.d.ts`** imports `AppLocale` from `../toSort-propal/page/page` and the toaster enums from
  `../toSort-propal/toaster/…` (the real file is `components/core/toaster/`), and still types the removed tags.
  A build regenerates it with no `toSort-propal` reference and the correct toaster path. Task 3.
- **`stencil.config.ts`**: the commented-out `bundles` list names `ds-page`, `ds-app-menu`, `ds-cart-block`,
  `ds-back-to-top-button` (and `ds-product-block`, `ds-account-block`, which do not exist either). Task 3.
- **Generated readmes** still list removed components under "Used by": `components/core/responsive/readme.md`
  (`ds-page`), `components/core/text/readme.md` and `components/core/title/readme.md` (`ds-product-list-header`),
  `components/core/trigger/readme.md` (`ds-app-menu`, `ds-back-to-top-button`, `ds-search`).
  `stencil build --docs` regenerates them. Task 3.
- **`typescript/dot-stash.ts`** sets `_ds.app.component = document.querySelector("ds-page")` at module load;
  `_ds.tools.getAppComponent()` and `_ds.app.addToCart()` depend on `ds-page`, which no longer exists. Task 7.
- **`components/core/rating-list/rating-list.scss`** styles `ds-grade-star`. Task 24, if `grade-star` is recovered.
- **Theme SCSS** still targets classes of removed components. These selectors are dead or also match theme
  templates, so they are harmless: `.ds-page` (`scss/layout/page.scss`, `scss/components/block.scss`,
  `scss/pages/cart.scss`, `category.scss`, `index.scss`), `.ds-app-menu` and `ds-cart-block` (`scss/layout/nav.scss`),
  `scss/components/pronto/{address,back-to-top-button,cart-block,cart-summary,product-list-header,search}.scss`,
  `.ds-address` (`scss/pages/addresses.scss`), `.ds-auth` (`scss/pages/checkout.scss`), `.ds-orders`
  (`scss/pages/history.scss`), `.ds-form` (`scss/components/form/form.scss`, `scss/pages/contact.scss`,
  `scss/pages/identity.scss`), `ds-vimeo` (`scss/index.scss`). Review with Task 24: keep the styles of
  recovered components and drop the rest.
