import { newSpecPage } from '@stencil/core/testing';
import { DSVideo } from './video';

describe('ds-video', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  /** newSpecPage resets the window: the spies are installed once the page exists, then the content is rendered. */
  const render = async (html: string) => {
    const page = await newSpecPage({ components: [DSVideo], html: '' });

    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    (window as { innerHeight: number }).innerHeight = 600;

    await page.setContent(html);
    return page;
  };

  const scrollListeners = (spy: jest.SpyInstance) => spy.mock.calls.filter(([type]) => type === 'scroll').map(([, listener]) => listener);

  /** Puts the element below the fold, or back on screen. */
  const setOffsetTop = (element: HTMLElement, offsetTop: number) => Object.defineProperty(element, 'offsetTop', { value: offsetTop, configurable: true });

  /** The player's muted state: Stencil sets the `muted` property in browsers, the attribute in the mock DOM, which has no such property. */
  const isMuted = (video: HTMLVideoElement) => video.muted ?? video.hasAttribute('muted');

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('removes the scroll watcher it added when it is disconnected', async () => {
    const page = await render('<ds-video autoplay sources="/video.mp4"></ds-video>');
    const [scrollListener] = scrollListeners(addEventListenerSpy);

    expect(scrollListeners(addEventListenerSpy)).toHaveLength(1);

    page.root.remove();
    await page.waitForChanges();

    expect(scrollListeners(removeEventListenerSpy)).toEqual([scrollListener]);
  });

  it('plays the video once it is scrolled on screen, after one 50 ms debounce, then stops watching', async () => {
    const page = await render('<ds-video autoplay sources="/video.mp4"></ds-video>');
    const video = page.root.querySelector('video');
    video.play = jest.fn(() => Promise.resolve());
    const [scrollListener] = scrollListeners(addEventListenerSpy);

    jest.useFakeTimers();
    setOffsetTop(page.root, 2000);
    window.dispatchEvent(new Event('scroll'));
    jest.advanceTimersByTime(50);
    expect(video.play).not.toHaveBeenCalled();

    setOffsetTop(page.root, 100);
    window.dispatchEvent(new Event('scroll'));
    jest.advanceTimersByTime(50);

    expect(video.play).toHaveBeenCalledTimes(1);
    expect(scrollListeners(removeEventListenerSpy)).toEqual([scrollListener]);
  });

  it('mutes and unmutes the player', async () => {
    const page = await render('<ds-video sources="/video.mp4"></ds-video>');
    const video = page.root.querySelector('video');

    expect(isMuted(video)).toBe(false);

    await page.root.mute();
    await page.waitForChanges();
    expect(isMuted(video)).toBe(true);
    expect(page.root).toHaveClass('--muted');

    await page.root.unmute();
    await page.waitForChanges();
    expect(isMuted(video)).toBe(false);
  });

  it('starts muted with autoplay (autoplay policies), and can be unmuted', async () => {
    const page = await render('<ds-video autoplay sources="/video.mp4"></ds-video>');
    const video = page.root.querySelector('video');

    expect(isMuted(video)).toBe(true);

    await page.root.unmute();
    await page.waitForChanges();
    expect(isMuted(video)).toBe(false);
  });

  it('does not watch the scroll without autoplay', async () => {
    await render('<ds-video sources="/video.mp4"></ds-video>');

    expect(scrollListeners(addEventListenerSpy)).toHaveLength(0);
  });
});
