import { describe, expect, it } from 'vitest';
import { formatLabel, formatPluralLabel } from './labels';

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

describe('formatPluralLabel', () => {
  const characters = { one: '{count} character', other: '{count} characters' };

  it('picks the template of the plural category of the count in the language', () => {
    expect([0, 1, 2].map(count => formatPluralLabel(characters, count, 'en'))).toEqual(['0 characters', '1 character', '2 characters']);
    // French: 0 and 1 are "one".
    expect([0, 1, 2].map(count => formatPluralLabel({ one: '{count} caractère', other: '{count} caractères' }, count, 'fr'))).toEqual([
      '0 caractère',
      '1 caractère',
      '2 caractères',
    ]);
    // Polish: one, few, many.
    const polish = { one: '{count} znak', few: '{count} znaki', many: '{count} znaków', other: '{count} znaku' };
    expect([1, 3, 5, 22].map(count => formatPluralLabel(polish, count, 'pl'))).toEqual(['1 znak', '3 znaki', '5 znaków', '22 znaki']);
  });

  it('uses the other template for a missing category, one template for every count, English without a known language', () => {
    expect(formatPluralLabel({ other: '{count} left' }, 1, 'en')).toBe('1 left');
    expect(formatPluralLabel('{count} left of {max}', 1, 'en', { max: 10 })).toBe('1 left of 10');
    expect(formatPluralLabel(characters, 1, 'not a language!')).toBe('1 character');
    expect(formatPluralLabel(characters, 1)).toBe('1 character');
    expect(formatPluralLabel(undefined, 1)).toBe('');
  });
});
