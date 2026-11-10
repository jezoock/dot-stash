/** The accessible name of ds-back-to-top without `label`. */
export const DS_BACK_TO_TOP_DEFAULT_LABEL = 'Back to top';

/** How far the page is scrolled before ds-back-to-top shows, without a valid `threshold`: one viewport height. */
export const DS_BACK_TO_TOP_DEFAULT_THRESHOLD = '100vh';

/**
 * The elements the focus goes to after the scroll, without a `target` (or when it matches nothing), the first one found:
 * the element of the `#top` fragment, the main landmark, the first heading; else the body.
 */
export const DS_BACK_TO_TOP_TARGETS = ['#top', 'main, [role="main"]', 'h1, h2, h3, h4, h5, h6, [role="heading"]'];
