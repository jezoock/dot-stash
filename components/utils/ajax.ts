/**
 * `fetch` wrappers for JSON endpoints.
 */

export type QueryParams = Record<string, string | number | boolean>;

export type PostPayload = string | Record<string, string> | string[][] | URLSearchParams;

/** Parses the response body as JSON: resolves with it when the status is OK, rejects with it otherwise. */
const readJSON = <T>(response: Response): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    response
      .json()
      .then(response.ok ? resolve : reject)
      .catch(reject);
  });

/** Encodes `{ a: 1, b: 'x y' }` as `a=1&b=x%20y`. */
export const buildQuery = (queryParams: QueryParams): string =>
  Object.entries(queryParams)
    .map(pair => pair.map(encodeURIComponent).join('='))
    .join('&');

/** GET request; the response body is parsed as JSON. */
export const get = <T = unknown>(url: string, queryParams?: QueryParams): Promise<T> =>
  fetch(`${url}${queryParams ? `?${buildQuery(queryParams)}` : ''}`).then(response => readJSON<T>(response));

/** Form-encoded POST request; the response body is parsed as JSON. */
export const post = <T = unknown>(url: string, payload: PostPayload = {}): Promise<T> => {
  return fetch(url, {
    headers: new Headers({
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Access-Control-Origin': '*',
    }),
    method: 'POST',
    body: new URLSearchParams(payload),
  }).then(response => readJSON<T>(response));
};
