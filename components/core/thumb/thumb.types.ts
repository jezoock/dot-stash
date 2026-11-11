import { DS_THUMB_LOADING } from './thumb.constants';

/** How the image of ds-thumb loads: `lazy` (when it nears the viewport) or `eager`. */
export type DSThumbLoading = (typeof DS_THUMB_LOADING)[number];

/** The state of the image of ds-thumb: no source, loading, loaded, or failed. */
export type DSThumbStatus = 'empty' | 'loading' | 'loaded' | 'error';
