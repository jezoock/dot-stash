/**
 * DOM and document helpers.
 */

/** Removes the whitespace between tags and collapses the other whitespace runs to one space. */
export const cleanHTML = (HTMLString: string): string => HTMLString.replace(/>[\r\n ]+</g, '><').replace(/(<.*?>)|\s+/g, (_, $1) => $1 || ' ');

/**
 * Adds an async script to `<head>`. Resolves with `true` once loaded; rejects on error,
 * or when an element with the same id already exists.
 */
export const loadScript = (scriptUrl: string, scriptId: string): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    if (!document.querySelector(`#${scriptId}`)) {
      const script = document.createElement('script');

      script.id = scriptId;
      script.async = true;
      script.defer = true;
      script.src = scriptUrl;
      script.onerror = err => reject(err);
      script.onload = () => resolve(true);

      document.querySelector('head')?.appendChild(script);
    } else {
      reject(`[WARNING] ds loadScript - script already loaded: ${scriptUrl}`);
    }
  });
};

/** Scrolls the window to the element matching `selector`, `offset` px above it. */
export const scrollTo = (selector: string, offset = 100): void => {
  const scrollY = document.querySelector<HTMLElement>(selector).offsetTop - offset;
  window.scroll(0, scrollY);
};

/** Returns the extension of the file name at the end of a path or URL, or `''`. */
export const getFileExtension = (fileLocation: string): string => {
  const filename = fileLocation.split('/').pop();
  return filename?.substring(filename.lastIndexOf('.') + 1, filename.length) || '';
};

/** Position of an element relative to the document. */
export const getOffset = (el: Element): { top: number; left: number } => {
  const box = el.getBoundingClientRect();

  return {
    top: box.top + window.pageYOffset - document.documentElement.clientTop,
    left: box.left + window.pageXOffset - document.documentElement.clientLeft,
  };
};
