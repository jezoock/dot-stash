# greenbox-address-list



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

 - [greenbox-account-profile](../../greenbox-account/greenbox-account-profile)
 - [greenbox-address-search](../greenbox-address-search)

### Graph
```mermaid
graph TD;
  greenbox-account-profile --> greenbox-address-list
  greenbox-address-search --> greenbox-address-list
  style greenbox-address-list fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
