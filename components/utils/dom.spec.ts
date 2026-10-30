import { cleanHTML, getFileExtension, scrollTo } from './dom';

describe('dom', () => {
  describe('scrollTo', () => {
    let scrollSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
      scrollSpy = jest.spyOn(window, 'scroll').mockImplementation(() => undefined);
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      scrollSpy.mockRestore();
      warnSpy.mockRestore();
      document.body.innerHTML = '';
    });

    it('scrolls to the element, offset px above it', () => {
      document.body.innerHTML = '<div id="target"></div>';
      Object.defineProperty(document.querySelector('#target'), 'offsetTop', { value: 500 });

      scrollTo('#target', 80);

      expect(scrollSpy).toHaveBeenCalledWith(0, 420);
    });

    it('does nothing, with a warning, when no element matches', () => {
      expect(() => scrollTo('#missing')).not.toThrow();
      expect(scrollSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('#missing'));
    });
  });

  describe('getFileExtension', () => {
    it('returns the extension of the last path segment', () => {
      expect(getFileExtension('/videos/intro.MP4')).toBe('MP4');
      expect(getFileExtension('https://example.com/a/b.tar.gz')).toBe('gz');
    });
  });

  describe('cleanHTML', () => {
    it('removes the whitespace between tags and collapses the rest', () => {
      expect(cleanHTML('<p>\n  <b>a   b</b>\n</p>')).toBe('<p><b>a b</b></p>');
    });
  });
});
