# ds-ajax

## Styling

- **Classes**: `ds-ajax` on `<ds-ajax>`, and `--is-loading` while it loads.
- **Attributes** (reflected): `on`, `target`, `suffix`. While it loads, the target has `aria-busy="true"` (see [Accessibility](#accessibility)).
- **Content**: the link (`a`) whose URL is loaded, a child of `<ds-ajax>` (no slot: the component renders no element of its own). After a failed load, an error message follows it: `p.ds-ajax__error`, with the `ds-message --error` classes of the theme.
- **Structure** (`ajax.scss`): while it loads, an overlay (`::before`) covers the `ds-ajax` element and takes the pointer, and a loading indicator (`::after`) is in its center, above the overlay. The overlay covers the component even when the content goes to another `target`.
- **Look** (default theme, `components/_ajax.scss`): a translucent white veil and a spinning `arrows-cw` icon (an SVG image drawn in the spinner color, a square of 1em of the spinner size, not read by screen readers), from the custom properties below, set on `ds-ajax`. The error message is a `.ds-message.--error` (`components/_message.scss`). A loaded content that takes the focus (see below) has the focus indicator of the theme.

Override them after the theme stylesheet (see [Styling a component](../../../README.md#styling-a-component)):

```css
ds-ajax {
  --ds-ajax-overlay-background: rgb(15 23 42 / 0.3);
  --ds-ajax-spinner-color: var(--ds-color-gray-white);
}
```

## Accessibility

- **Link**: the content is a native link: Tab reaches it, Enter loads (on `click`). While it loads, a new click or Enter does nothing.
- **Loading**: the target (the component, or the `target` element) is `aria-busy="true"` until the content is in place; the loading indicator is decorative.
- **Loaded in the component** (`target="self"`): the link is replaced by the content. When the focus was on the link (or in the component), it goes to the component (`tabindex="-1"`, without scrolling), so that it is not lost and a screen reader reads the content from there; Tab then goes on into the content.
- **Loaded in another target** after a click: the link keeps the focus, and the target is a polite live region (`aria-live="polite"`, unless it has an `aria-live` of its own): a screen reader reads the new content once it is in place (`aria-busy` removed). A load on `load` is part of the page: no live region, no focus.
- **Errors**: a failed load (a network or HTTP error, a response without `.ds-ajax-content`) shows `error-message` ("The content could not be loaded." by default) in an alert after the link (`role="alert"`: read at once), removed by the next load; the link stays, to try again. With `error-message=""`, no message: listen to `ajaxError` to show one.
- **Events**: `ajaxLoaded` (`detail.target`, `detail.url`) once the content is in place, `ajaxError` (`detail.url`, `detail.error`) when it could not be loaded.

```html
<ds-ajax><a href="/products?page=2">More products</a></ds-ajax>

<ds-ajax target="#results" error-message="Les résultats n'ont pas pu être chargés."><a href="/search?q=lamp">Search</a></ds-ajax>
<div id="results"></div>
```

**Changed**: `aria-busy`, the focus of the loaded content, the live region of another target, the error message (`error-message`), the `ajaxLoaded` and `ajaxError` events are new; a load on `load` starts before the first render (it rendered the component again, with a Stencil warning); a click while it loads is ignored.

<!-- Auto Generated Below -->


## Overview

A simple component to load ajax content: on `click` (default) or `load`, it requests the URL of its link
as text (HTML) and puts the content of the response's `.ds-ajax-content` element in the target.
While it loads, the target is `aria-busy="true"`. Loaded in the component itself (the link is replaced), the content
takes the focus when the link had it; loaded in another target after a click, the target is a polite live region, which
screen readers read. A failed load shows `error-message` in an alert (`role="alert"`) after the link, and emits
`ajaxError`; a load emits `ajaxLoaded`.
Version: 1.0

## Properties

| Property       | Attribute       | Description                                                                                                                                       | Type                | Default                              |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------ |
| `errorMessage` | `error-message` | The message shown (and announced: `role="alert"`) after the link when the content could not be loaded. Empty: no message (listen to `ajaxError`). | `string`            | `'The content could not be loaded.'` |
| `on`           | `on`            | Event that will trigger the loading of the ajax content: `click` (default) or `load`                                                              | `"click" \| "load"` | `'click'`                            |
| `suffix`       | `suffix`        | If the url can be crawled by search bots, one should pass an additional query param to tell server to render url in "ajax mode"                   | `string`            | `''`                                 |
| `target`       | `target`        | Where to display the content, can be the component itself or an element specified by a css selector                                               | `string`            | `'self'`                             |


## Events

| Event        | Description                                                                  | Type                                                 |
| ------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| `ajaxError`  | Emitted when the content could not be loaded (`detail.url`, `detail.error`). | `CustomEvent<{ url: string; error: unknown; }>`      |
| `ajaxLoaded` | Emitted once the content is in the target (`detail.target`, `detail.url`).   | `CustomEvent<{ target: HTMLElement; url: string; }>` |


## CSS Custom Properties

| Name                           | Description                                                                 |
| ------------------------------ | --------------------------------------------------------------------------- |
| `--ds-ajax-overlay-background` | Background of the overlay that covers the content while it loads.           |
| `--ds-ajax-spinner-color`      | Color of the loading indicator.                                             |
| `--ds-ajax-spinner-size`       | Size of the loading indicator (its font size: the icon is a square of 1em). |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
