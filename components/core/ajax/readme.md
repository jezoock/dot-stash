# ds-ajax



<!-- Auto Generated Below -->


## Overview

A simple component to load ajax content: on `click` (default) or `load`, it requests the URL of its link
as text (HTML) and puts the content of the response's `.ds-ajax-content` element in the target.
Version: 1.0

## Properties

| Property | Attribute | Description                                                                                                                     | Type                | Default   |
| -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------- |
| `on`     | `on`      | Event that will trigger the loading of the ajax content: `click` (default) or `load`                                            | `"click" \| "load"` | `'click'` |
| `suffix` | `suffix`  | If the url can be crawled by search bots, one should pass an additional query param to tell server to render url in "ajax mode" | `string`            | `''`      |
| `target` | `target`  | Where to display the content, can be the component itself or an element specified by a css selector                             | `string`            | `'self'`  |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
