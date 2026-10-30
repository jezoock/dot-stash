import * as ajax from './ajax';
import * as context from './context';
import * as css from './css';
import * as dom from './dom';
import * as env from './env';
import * as form from './form';
import * as props from './props';
import * as responsive from './responsive';

/**
 * All the utility modules in one object: `ds.props.toClassList(...)`, `ds.css.set(...)`…
 * Importing the functions from their module instead (`import { toClassList } from './props'`)
 * lets bundlers drop the unused ones.
 */
const ds = {
  ajax,
  context,
  css,
  dom,
  env,
  form,
  props,
  responsive,
  /** The DOM helpers and the Sass bridge, under their former key. */
  tools: {
    cleanHTML: dom.cleanHTML,
    getFileExtension: dom.getFileExtension,
    getOffset: dom.getOffset,
    loadScript: dom.loadScript,
    scrollTo: dom.scrollTo,
    getStylesJSON: responsive.getStylesJSON,
    removeQuotes: responsive.removeQuotes,
  },
};

export default ds;
