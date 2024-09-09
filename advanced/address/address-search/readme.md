# ds-address



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
 - [ds-cart](../../ds-cart)
 - [ds-checkout-shipping](../../ds-checkout/ds-checkout-shipping)
 - [ds-header](../../ds-header)
 - [ds-menu](../../ds-menu)

### Depends on

- [ds-deadline-selector](../../toolkit/deadline-selector)
- [ds-datetime](../../ds-datetime)
- [ds-address-autocomplete](../../toolkit/address-autocomplete)
- [ds-address-list](../ds-address-list)

### Graph
```mermaid
graph TD;
  ds-address-search --> ds-deadline-selector
  ds-address-search --> ds-datetime
  ds-address-search --> ds-address-autocomplete
  ds-address-search --> ds-address-list
  ds-deadline-selector --> ds-delivery-deadline-modal
  ds-deadline-selector --> ds-loader
  ds-delivery-deadline-modal --> ds-modal
  ds-delivery-address-modal --> ds-address-search
  ds-cart --> ds-address-search
  ds-checkout-shipping --> ds-address-search
  ds-header --> ds-address-search
  ds-menu --> ds-address-search
  style ds-address-search fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
