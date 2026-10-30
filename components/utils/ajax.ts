/**
 * `fetch` wrappers.
 */

export type QueryParams = Record<string, string | number | boolean>;

export type PostPayload = string | Record<string, string> | string[][] | URLSearchParams;

/** How the response body is read: parsed as JSON, or returned as text (HTML, plain text…). */
export type ResponseType = 'json' | 'text';

export interface GetOptions {
  /** `'json'` (default) parses the body as JSON; `'text'` returns it as a string. */
  responseType?: ResponseType;
}

/** Reads the response body: resolves with it when the status is OK, rejects with it otherwise (or with the parse error). */
const readBody = <T>(response: Response, responseType: ResponseType = 'json'): Promise<T> =>
  (responseType === 'text' ? response.text() : response.json()).then(body => (response.ok ? (body as T) : Promise.reject(body)));

/** Encodes `{ a: 1, b: 'x y' }` as `a=1&b=x%20y`. */
export const buildQuery = (queryParams: QueryParams): string =>
  Object.entries(queryParams)
    .map(pair => pair.map(encodeURIComponent).join('='))
    .join('&');

/** Adds a query string to a URL, after its own query string if it has one. */
const withQuery = (url: string, queryParams?: QueryParams): string => {
  const query = queryParams ? buildQuery(queryParams) : '';
  return query ? `${url}${url.includes('?') ? '&' : '?'}${query}` : url;
};

/**
 * GET request. The response body is parsed as JSON, unless `options.responseType` is `'text'`:
 * `get<string>('/fragment.html', undefined, { responseType: 'text' })`.
 */
export const get = <T = unknown>(url: string, queryParams?: QueryParams, options: GetOptions = {}): Promise<T> =>
  fetch(withQuery(url, queryParams)).then(response => readBody<T>(response, options.responseType));

/** Form-encoded POST request; the response body is parsed as JSON. */
export const post = <T = unknown>(url: string, payload: PostPayload = {}): Promise<T> => {
  return fetch(url, {
    headers: new Headers({
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    }),
    method: 'POST',
    body: new URLSearchParams(payload),
  }).then(response => readBody<T>(response));
};
