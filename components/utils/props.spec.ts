import { describe, expect, it } from 'vitest';
import { fromJSON, isTrue, toArray, toClassList, toFloat, toNumber, toString } from './props';

describe('props', () => {
  describe('isTrue', () => {
    it.each([
      [true, true],
      [false, false],
      [undefined, false],
      [null, false],
      ['true', true],
      ['TRUE', true],
      ['', true],
      ['1', true],
      ['false', false],
      ['0', false],
      ['yes', false],
    ])('isTrue(%j) is %j', (prop, expected) => {
      expect(isTrue(prop as string | boolean)).toBe(expected);
    });
  });

  describe('toNumber / toFloat', () => {
    it('returns numbers as they are', () => {
      expect(toNumber(3)).toBe(3);
      expect(toFloat(1.5)).toBe(1.5);
    });

    it('parses strings', () => {
      expect(toNumber('12')).toBe(12);
      expect(toNumber('12.9px')).toBe(12);
      expect(toFloat('1.25')).toBe(1.25);
    });
  });

  describe('toArray', () => {
    it('splits a comma-separated string', () => {
      expect(toArray('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('returns an array as it is', () => {
      const array = ['a', 'b'];
      expect(toArray(array)).toBe(array);
    });
  });

  describe('fromJSON', () => {
    it('parses a JSON string', () => {
      expect(fromJSON('{"a":1}')).toEqual({ a: 1 });
    });

    it('returns a non-string value as it is', () => {
      const value = { a: 1 };
      expect(fromJSON(value)).toBe(value);
    });

    it('returns the rootKey entry', () => {
      expect(fromJSON('{"a":{"b":2}}', 'a')).toEqual({ b: 2 });
      expect(fromJSON({ a: 3 }, 'a')).toBe(3);
    });
  });

  describe('toClassList', () => {
    it('builds the class map with modifiers', () => {
      expect(toClassList('ds-card', 'large,dark')).toEqual({ 'ds-card': true, '--large': true, '--dark': true });
    });

    it('accepts arrays and ignores blank entries', () => {
      expect(toClassList(['ds-a', ' ', 'ds-b '], ['', ' x '])).toEqual({ 'ds-a': true, 'ds-b': true, '--x': true });
    });

    it('works without modifiers', () => {
      expect(toClassList('ds-card')).toEqual({ 'ds-card': true });
    });
  });

  describe('toString', () => {
    it('serializes attributes', () => {
      expect(toString({ disabled: true, checked: 'true', mods: ['a', 'b'], id: 'x' })).toBe('disabled checked mods="a,b" id="x"');
    });
  });
});
