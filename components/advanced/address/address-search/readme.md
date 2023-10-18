# greenbox-address



<!-- Auto Generated Below -->


## Properties

| Property                             | Attribute                             | Description | Type      | Default          |
| ------------------------------------ | ------------------------------------- | ----------- | --------- | ---------------- |
| `accuracyLevel`                      | `accuracy-level`                      |             | `number`  | `4`              |
| `accuracyRequired`                   | `accuracy-required`                   |             | `string`  | `"streetNumber"` |
| `autocomplete`                       | `autocomplete`                        |             | `any`     | `null`           |
| `autocomplete_componentRestrictions` | `autocomplete_component-restrictions` |             | `string`  | `"ch"`           |
| `autocomplete_delay`                 | `autocomplete_delay`                  |             | `number`  | `250`            |
| `autocomplete_minchar`               | `autocomplete_minchar`                |             | `number`  | `7`              |
| `displayMode`                        | `display-mode`                        |             | `string`  | `"large"`        |
| `estimation`                         | `estimation`                          |             | `number`  | `undefined`      |
| `mode`                               | `mode`                                |             | `string`  | `"geolocate"`    |
| `newAddressMode`                     | `new-address-mode`                    |             | `boolean` | `false`          |
| `place`                              | `place`                               |             | `any`     | `null`           |


## Dependencies

### Used by

 - [ds-delivery-address-modal](../../app/shop/modal/delivery-address-modal)
 - [greenbox-cart](../../greenbox-cart)
 - [greenbox-checkout-shipping](../../greenbox-checkout/greenbox-checkout-shipping)
 - [greenbox-header](../../greenbox-header)
 - [greenbox-menu](../../greenbox-menu)

### Depends on

- [ds-deadline-selector](../../toolkit/deadline-selector)
- [greenbox-datetime](../../greenbox-datetime)
- [ds-address-autocomplete](../../toolkit/address-autocomplete)
- [greenbox-address-list](../greenbox-address-list)

### Graph
```mermaid
graph TD;
  greenbox-address-search --> ds-deadline-selector
  greenbox-address-search --> greenbox-datetime
  greenbox-address-search --> ds-address-autocomplete
  greenbox-address-search --> greenbox-address-list
  ds-deadline-selector --> ds-delivery-deadline-modal
  ds-deadline-selector --> greenbox-loader
  ds-delivery-deadline-modal --> greenbox-modal
  ds-delivery-address-modal --> greenbox-address-search
  greenbox-cart --> greenbox-address-search
  greenbox-checkout-shipping --> greenbox-address-search
  greenbox-header --> greenbox-address-search
  greenbox-menu --> greenbox-address-search
  style greenbox-address-search fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
