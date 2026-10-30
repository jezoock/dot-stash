import { newSpecPage } from '@stencil/core/testing';
import { DSButton } from '../button/button';
import { DSVideo } from './video';

describe('ds-video', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  /** newSpecPage resets the window: the spies are installed once the page exists, then the content is rendered. */
  const render = async (html: string) => {
    const page = await newSpecPage({ components: [DSVideo, DSButton], html: '' });

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

  it('renders a ds-button per control, and a click on a button calls its method', async () => {
    const page = await render('<ds-video controls sources="/video.mp4"></ds-video>');
    const video = page.root.querySelector('video');
    video.play = jest.fn(() => Promise.resolve());
    video.pause = jest.fn();
    const button = (name: string) => page.root.querySelector(`.ds-video__${name}-button`) as HTMLElement;
    const click = async (name: string) => {
      (button(name).querySelector('button') as HTMLElement).click();
      await page.waitForChanges();
    };

    expect(['pause', 'play', 'mute', 'unmute'].map(name => [button(name).className, button(name).querySelector('button').getAttribute('aria-label')])).toEqual([
      ['ds-video__pause-button ds-button --video-player --pause', 'Pause'],
      ['ds-video__play-button ds-button --video-player --play', 'Play'],
      ['ds-video__mute-button ds-button --video-player --mute', 'Mute'],
      ['ds-video__unmute-button ds-button --video-player --unmute', 'Unmute'],
    ]);

    await click('play');
    expect(video.play).toHaveBeenCalledTimes(1);
    expect(page.root).toHaveClass('--playing');

    await click('pause');
    expect(video.pause).toHaveBeenCalledTimes(1);
    expect(page.root).toHaveClass('--paused');

    await click('mute');
    expect(page.root).toHaveClass('--muted');

    await click('unmute');
    expect(page.root).not.toHaveClass('--muted');
  });

  it('does not watch the scroll without autoplay', async () => {
    await render('<ds-video sources="/video.mp4"></ds-video>');

    expect(scrollListeners(addEventListenerSpy)).toHaveLength(0);
  });

  /** A player whose play() resolves, or rejects with the given error name. */
  const mockPlayer = (video: HTMLVideoElement, rejection?: string) => {
    video.play = jest.fn(() => (rejection ? Promise.reject(Object.assign(new Error(rejection), { name: rejection })) : Promise.resolve()));
    video.pause = jest.fn();
    video.load = jest.fn();
  };

  const state = (page): string[] => ['--playing', '--paused'].filter(className => page.root.classList.contains(className));

  it('stop() leaves the playing and paused states, also once the player emits its pause event', async () => {
    const page = await render('<ds-video sources="/video.mp4"></ds-video>');
    const video = page.root.querySelector('video');
    mockPlayer(video);

    await page.root.play();
    await page.waitForChanges();
    expect(state(page)).toEqual(['--playing']);

    await page.root.stop();
    video.dispatchEvent(new Event('pause'));
    await page.waitForChanges();
    expect(state(page)).toEqual([]);
    expect(video.load).toHaveBeenCalledTimes(1);

    await page.root.play();
    await page.root.pause();
    await page.root.stop();
    await page.waitForChanges();
    expect(state(page)).toEqual([]);
  });

  it('when the browser refuses to play (autoplay blocked), it is back to not playing and emits playError', async () => {
    const page = await render('<ds-video sources="/video.mp4"></ds-video>');
    const video = page.root.querySelector('video');
    const errors: string[] = [];
    page.root.addEventListener('playError', (event: CustomEvent) => errors.push(event.detail.error.name));
    mockPlayer(video, 'NotAllowedError');

    await page.root.play();
    await page.waitForChanges();
    expect(state(page)).toEqual([]);
    expect(errors).toEqual(['NotAllowedError']);

    // Paused before: paused again.
    await page.root.pause();
    await page.root.play();
    await page.waitForChanges();
    expect(state(page)).toEqual(['--paused']);
    expect(errors).toEqual(['NotAllowedError', 'NotAllowedError']);

    // Allowed again (after a user gesture): it plays.
    mockPlayer(video);
    await page.root.play();
    await page.waitForChanges();
    expect(state(page)).toEqual(['--playing']);
  });

  it('a play() interrupted by pause() (AbortError) emits no playError and stays paused', async () => {
    const page = await render('<ds-video sources="/video.mp4"></ds-video>');
    const video = page.root.querySelector('video');
    const onPlayError = jest.fn();
    page.root.addEventListener('playError', onPlayError);
    let rejectPlay: (error: Error) => void;
    mockPlayer(video);
    video.play = jest.fn(() => new Promise<void>((_, reject) => (rejectPlay = reject)));

    const playing = page.root.play();
    await page.root.pause();
    rejectPlay(Object.assign(new Error('interrupted'), { name: 'AbortError' }));
    await playing;
    await page.waitForChanges();

    expect(state(page)).toEqual(['--paused']);
    expect(onPlayError).not.toHaveBeenCalled();
  });

  it("follows the player's own play and pause events, without calling play() again", async () => {
    const page = await render('<ds-video sources="/video.mp4"></ds-video>');
    const video = page.root.querySelector('video');
    mockPlayer(video);

    video.dispatchEvent(new Event('play'));
    await page.waitForChanges();
    expect(state(page)).toEqual(['--playing']);
    expect(video.play).not.toHaveBeenCalled();

    video.dispatchEvent(new Event('pause'));
    await page.waitForChanges();
    expect(state(page)).toEqual(['--paused']);
  });
});
