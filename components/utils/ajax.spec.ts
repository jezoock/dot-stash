import { buildQuery, get, post } from './ajax';

interface FakeBody {
  ok?: boolean;
  json?: unknown;
  text?: string;
}

/** A minimal `Response`: only what the ajax helpers read. */
const fakeResponse = ({ ok = true, json, text = '' }: FakeBody) => ({
  ok,
  json: jest.fn(() => (json === undefined ? Promise.reject(new SyntaxError('Unexpected token')) : Promise.resolve(json))),
  text: jest.fn(() => Promise.resolve(text)),
});

describe('ajax', () => {
  let fetchMock: jest.Mock;
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('buildQuery', () => {
    it('encodes the parameters', () => {
      expect(buildQuery({ a: 1, b: 'x y', c: true })).toBe('a=1&b=x%20y&c=true');
    });
  });

  describe('get', () => {
    it('parses JSON by default', async () => {
      const response = fakeResponse({ json: { a: 1 } });
      fetchMock.mockResolvedValue(response);

      await expect(get('/api', { q: 'x y' })).resolves.toEqual({ a: 1 });
      expect(fetchMock).toHaveBeenCalledWith('/api?q=x%20y');
      expect(response.text).not.toHaveBeenCalled();
    });

    it('returns the body as text with responseType "text"', async () => {
      const response = fakeResponse({ text: '<div class="ds-ajax-content">Hello</div>' });
      fetchMock.mockResolvedValue(response);

      await expect(get<string>('/page.html', undefined, { responseType: 'text' })).resolves.toBe('<div class="ds-ajax-content">Hello</div>');
      expect(fetchMock).toHaveBeenCalledWith('/page.html');
      expect(response.json).not.toHaveBeenCalled();
    });

    it('rejects with the body when the status is not OK', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ ok: false, json: { error: 'nope' } }));
      await expect(get('/api')).rejects.toEqual({ error: 'nope' });

      fetchMock.mockResolvedValue(fakeResponse({ ok: false, text: 'Not found' }));
      await expect(get('/missing', undefined, { responseType: 'text' })).rejects.toBe('Not found');
    });

    it('rejects when a JSON body cannot be parsed', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ text: '<html></html>' }));
      await expect(get('/page.html')).rejects.toBeInstanceOf(SyntaxError);
    });

    it('appends the query to a URL that already has one', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: {} }));

      await get('/api?lang=fr', { q: 1 });
      expect(fetchMock).toHaveBeenCalledWith('/api?lang=fr&q=1');
    });

    it('adds no "?" for empty parameters', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: {} }));

      await get('/api', {});
      expect(fetchMock).toHaveBeenCalledWith('/api');
    });
  });

  describe('post', () => {
    it('sends a form-encoded body without a non-standard CORS request header', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: { saved: true } }));

      await expect(post('/api', { a: '1', b: 'x y' })).resolves.toEqual({ saved: true });

      const [url, init] = fetchMock.mock.calls[0];
      const headers = init.headers as Headers;
      expect(url).toBe('/api');
      expect(init.method).toBe('POST');
      expect(String(init.body)).toBe('a=1&b=x+y');
      expect(headers.get('Content-Type')).toBe('application/x-www-form-urlencoded; charset=UTF-8');
      expect(headers.has('Access-Control-Origin')).toBe(false);
    });
  });
});
