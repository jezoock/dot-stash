import { newSpecPage } from '@stencil/core/testing';
import { DSSlideMsg } from './marquee';

describe('ds-marquee', () => {
  let frames: Map<number, FrameRequestCallback>;
  let cancelSpy: jest.Mock;

  /** Runs the pending animation frames at the given time (ms). */
  const runFrame = (time: number) => {
    const callbacks = Array.from(frames.values());
    frames.clear();
    callbacks.forEach(callback => callback(time));
  };

  /** newSpecPage resets the window: requestAnimationFrame is replaced once the page exists, then the content is rendered. */
  const render = async (html: string) => {
    const page = await newSpecPage({ components: [DSSlideMsg], html: '' });

    let lastId = 0;
    frames = new Map();
    const requestSpy = jest.fn((callback: FrameRequestCallback) => {
      lastId += 1;
      frames.set(lastId, callback);
      return lastId;
    });
    cancelSpy = jest.fn((id: number) => frames.delete(id));
    // The bare globals of the component are not the window ones in the spec environment: both are replaced.
    global.requestAnimationFrame = window.requestAnimationFrame = requestSpy;
    global.cancelAnimationFrame = window.cancelAnimationFrame = cancelSpy;

    await page.setContent(html);
    return page;
  };

  const firstMessage = page => page.root.querySelector('.ds-marquee__content').children[0] as HTMLElement;

  it('uses the default transition of the enum (slide-rtl)', async () => {
    const page = await render('<ds-marquee><span>News</span></ds-marquee>');

    expect(page.root).toHaveClass('--transition-slide-rtl');
    expect(page.root).not.toHaveClass('--transition-slide-left-to-right');
  });

  it('scrolls on animation frames, speed / 10 px per 4 ms', async () => {
    const page = await render('<ds-marquee speed="10"><span>News</span></ds-marquee>');

    runFrame(1000);
    runFrame(1016);
    expect(firstMessage(page).style.marginLeft).toBe('-4px');

    runFrame(1032);
    expect(firstMessage(page).style.marginLeft).toBe('-8px');
  });

  it('stops the animation when it is disconnected', async () => {
    const page = await render('<ds-marquee><span>News</span></ds-marquee>');
    runFrame(1000);
    const [pendingFrame] = Array.from(frames.keys());

    page.root.remove();
    await page.waitForChanges();

    expect(cancelSpy).toHaveBeenCalledWith(pendingFrame);
    expect(frames.size).toBe(0);
  });

  it('runs a single animation when start() is called again', async () => {
    const page = await render('<ds-marquee><span>News</span></ds-marquee>');

    await page.root.start();

    expect(frames.size).toBe(1);
  });

  it('pauses on hover only with pause-on-hover, also when the property changes', async () => {
    const page = await render('<ds-marquee pause-on-hover="true"><span>News</span></ds-marquee>');

    page.root.dispatchEvent(new MouseEvent('mouseover'));
    await page.waitForChanges();
    expect(page.root).toHaveClass('--paused');

    page.root.dispatchEvent(new MouseEvent('mouseout'));
    page.root.pauseOnHover = 'false';
    await page.waitForChanges();
    page.root.dispatchEvent(new MouseEvent('mouseover'));
    await page.waitForChanges();
    expect(page.root).toHaveClass('--playing');
  });

  it('reads a speed set as a string', async () => {
    const page = await render('<ds-marquee><span>News</span></ds-marquee>');

    page.root.speed = '0';
    await page.waitForChanges();

    expect(page.root).toHaveClass('--no-scroll');
  });
});
