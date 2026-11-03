import { formatLabel } from './labels';

describe('formatLabel', () => {
  it('replaces the placeholders of a template with their values', () => {
    expect(formatLabel('{index} of {count}', { index: 2, count: 5 })).toBe('2 of 5');
    expect(formatLabel('{label} submenu', { label: 'About' })).toBe('About submenu');
  });

  it('keeps an unknown placeholder, and gives an empty text for no template', () => {
    expect(formatLabel('Slide {index} {nope}', { index: 1 })).toBe('Slide 1 {nope}');
    expect(formatLabel(undefined, { index: 1 })).toBe('');
  });
});
