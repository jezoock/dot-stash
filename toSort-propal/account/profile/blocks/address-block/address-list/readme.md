# ds-address-list



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute | Description | Type     | Default  |
| ----------- | --------- | ----------- | -------- | -------- |
| `addresses` | --        |             | `any[]`  | `[]`     |
| `mode`      | `mode`    |             | `string` | `"view"` |


## Events

| Event                                  | Description | Type               |
| -------------------------------------- | ----------- | ------------------ |
| `addressList_notice_addressSet_event`  |             | `CustomEvent<any>` |
| `addressList_request_newAddress_event` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ds-account-profile](../../ds-account/ds-account-profile)
 - [ds-address-search](../ds-address-search)

### Graph
```mermaid
graph TD;
  ds-account-profile --> ds-address-list
  ds-address-search --> ds-address-list
  style ds-address-list fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
