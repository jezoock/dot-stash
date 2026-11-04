// Generates the icon map of the engine, scss/engine/variables/_icons.scss, from the SVG files of scss/engine/icons/ and
// its icons.json, which maps each icon name to an SVG file of the icon set (npm run build:icons):
//
//   node scripts/build-icons.mjs [--check]
//
//   --check  writes nothing: exits with code 1 if scss/engine/variables/_icons.scss is not what the script generates
//            (an SVG file or icons.json changed without running the script, or the generated file was edited). CI runs it.
//
// Each icon becomes an SVG data URI: the elements and attributes of the file, as they are, without the comments, the
// whitespace between the tags, and the class, width and height of the root <svg> (a mask scales the image to its box; the
// viewBox stays). An entry of icons.json is the name of an SVG file (without .svg), or an object: { "svg": <file>, and
// "fill": true (the whole icon filled: a solid shape) or a list of the positions of the shapes to fill (1 is the first),
// "rotate": 90, 180 or 270 (degrees, clockwise, around the center), "scale": a factor below 1 (the icon smaller in its
// box) }. The SVG files are copies of the icon set, unchanged: the variants are made here. Only the elements and attributes
// of an icon (no script, style, link, text or entity) are accepted, any other one is an error.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import config from '../dot-stash.config.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const iconsDir = path.join(root, config.paths.scss, 'engine', 'icons');
const destination = path.join(root, config.paths.scss, 'engine', 'variables', '_icons.scss');
const relative = file => path.relative(root, file).split(path.sep).join('/');

/** The elements of an icon, and the attributes each one may have. */
const SHAPE_ATTRIBUTES = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'transform'];
const ELEMENTS = {
  svg: ['xmlns', 'viewBox', 'width', 'height', 'class', ...SHAPE_ATTRIBUTES],
  g: SHAPE_ATTRIBUTES,
  path: ['d', ...SHAPE_ATTRIBUTES],
  circle: ['cx', 'cy', 'r', ...SHAPE_ATTRIBUTES],
  ellipse: ['cx', 'cy', 'rx', 'ry', ...SHAPE_ATTRIBUTES],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry', ...SHAPE_ATTRIBUTES],
  line: ['x1', 'y1', 'x2', 'y2', ...SHAPE_ATTRIBUTES],
  polyline: ['points', ...SHAPE_ATTRIBUTES],
  polygon: ['points', ...SHAPE_ATTRIBUTES],
};
/** The attributes of the root <svg> left out: its class, and its size (the box of the mask sizes the image). */
const DROPPED_ROOT_ATTRIBUTES = ['class', 'width', 'height'];
const NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** The tags of an SVG file: [{ name, attributes: [[name, value]], closing, selfClosing }]. Throws on anything else. */
const parse = (source, file) => {
  const text = source.replace(/<!--[\s\S]*?-->/g, '').trim();
  const tagPattern = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[\w:-]+\s*=\s*"[^"<>&]*")*)\s*(\/?)>/y;
  const tags = [];
  let index = 0;

  while (index < text.length) {
    const whitespace = /\s*/y;
    whitespace.lastIndex = index;
    index += whitespace.exec(text)[0].length;
    if (index >= text.length) {
      break;
    }
    tagPattern.lastIndex = index;
    const match = tagPattern.exec(text);
    if (!match) {
      throw new Error(`${relative(file)}: unexpected content at "${text.slice(index, index + 40)}": an icon is made of SVG tags only.`);
    }
    const [whole, closing, name, attributeText, selfClosing] = match;
    if (!Object.hasOwn(ELEMENTS, name)) {
      throw new Error(`${relative(file)}: <${name}> is not an element of an icon (${Object.keys(ELEMENTS).join(', ')}).`);
    }
    const attributes = [...attributeText.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map(([, attribute, value]) => [attribute, value.replace(/\s+/g, ' ').trim()]);
    for (const [attribute] of attributes) {
      if (!ELEMENTS[name].includes(attribute)) {
        throw new Error(`${relative(file)}: the attribute ${attribute} of <${name}> is not one of an icon (${ELEMENTS[name].join(', ')}).`);
      }
    }
    tags.push({ name, attributes, closing: closing === '/', selfClosing: selfClosing === '/' });
    index += whole.length;
  }

  const [first] = tags;
  const last = tags.at(-1);
  if (!first || first.name !== 'svg' || first.closing || first.selfClosing || last.name !== 'svg' || !last.closing || tags.slice(1, -1).some(tag => tag.name === 'svg')) {
    throw new Error(`${relative(file)}: an icon is one <svg> element.`);
  }
  if (!first.attributes.some(([attribute, value]) => attribute === 'viewBox' && /^-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+$/.test(value))) {
    throw new Error(`${relative(file)}: the <svg> has no viewBox (min-x min-y width height).`);
  }
  if (!first.attributes.some(([attribute, value]) => attribute === 'xmlns' && value === 'http://www.w3.org/2000/svg')) {
    throw new Error(`${relative(file)}: the <svg> has no xmlns="http://www.w3.org/2000/svg".`);
  }
  return tags;
};

const setAttribute = (tag, name, value) => {
  const attribute = tag.attributes.find(([other]) => other === name);
  if (attribute) {
    attribute[1] = value;
  } else {
    tag.attributes.push([name, value]);
  }
};

const round = value => String(Math.round(value * 1000) / 1000);

/** Applies the variant of an entry of icons.json to the tags of its SVG file. */
const applyVariant = (tags, { fill, rotate, scale }, name) => {
  const svg = tags[0];
  const shapes = tags.filter(tag => !tag.closing && tag.name !== 'svg' && tag.name !== 'g');
  const [minX, minY, width, height] = svg.attributes
    .find(([attribute]) => attribute === 'viewBox')[1]
    .split(' ')
    .map(Number);
  const center = [minX + width / 2, minY + height / 2];

  if (fill === true) {
    setAttribute(svg, 'fill', 'currentColor');
  } else if (Array.isArray(fill)) {
    for (const position of fill) {
      if (!Number.isInteger(position) || position < 1 || position > shapes.length) {
        throw new Error(`icons.json: the fill of ${name} lists ${position}, not the position of one of its ${shapes.length} shapes (1 to ${shapes.length}).`);
      }
      setAttribute(shapes[position - 1], 'fill', 'currentColor');
    }
  } else if (fill !== undefined) {
    throw new Error(`icons.json: the fill of ${name} is true or a list of shape positions.`);
  }

  if (rotate !== undefined) {
    if (![90, 180, 270].includes(rotate)) {
      throw new Error(`icons.json: the rotate of ${name} is 90, 180 or 270.`);
    }
    tags.splice(1, 0, { name: 'g', attributes: [['transform', `rotate(${rotate} ${round(center[0])} ${round(center[1])})`]], closing: false, selfClosing: false });
    tags.splice(tags.length - 1, 0, { name: 'g', attributes: [], closing: true, selfClosing: false });
  }

  if (scale !== undefined) {
    if (typeof scale !== 'number' || scale <= 0 || scale >= 1) {
      throw new Error(`icons.json: the scale of ${name} is a number between 0 and 1.`);
    }
    // A larger viewBox around the same center: the icon is smaller in its box, and stays centered.
    const [scaledWidth, scaledHeight] = [width / scale, height / scale];
    setAttribute(svg, 'viewBox', [center[0] - scaledWidth / 2, center[1] - scaledHeight / 2, scaledWidth, scaledHeight].map(round).join(' '));
  }
};

/** The markup of the tags, attribute values in single quotes (the data URI is in a double-quoted url()). */
const serialize = tags =>
  tags
    .map(({ name, attributes, closing, selfClosing }) =>
      closing ? `</${name}>` : `<${name}${attributes.map(([attribute, value]) => ` ${attribute}='${value}'`).join('')}${selfClosing ? '/>' : '>'}`,
    )
    .join('');

/** An SVG as the URL of a data URI: the characters that a URL or a CSS string cannot hold as they are, percent-encoded. */
const toDataUri = svg => `data:image/svg+xml,${svg.replace(/[%#<>"{}\\^`|\s]|[^\x20-\x7e]/g, char => (char === ' ' ? ' ' : encodeURIComponent(char)))}`;

/** The entries of icons.json, read and checked: [{ name, svg, variant }]. */
const readManifest = () => {
  const manifestFile = path.join(iconsDir, 'icons.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  for (const key of ['set', 'package', 'version', 'notice']) {
    if (typeof manifest[key] !== 'string' || !manifest[key]) {
      throw new Error(`icons.json: "${key}" is missing.`);
    }
  }
  if (/\*\/|'|\\|#\{/.test(manifest.notice)) {
    throw new Error('icons.json: the notice holds no */, quote, backslash or #{ (it is written in a Sass string and a CSS comment).');
  }
  const entries = Object.entries(manifest.icons ?? {}).map(([name, entry]) => {
    if (!NAME.test(name)) {
      throw new Error(`icons.json: the icon name "${name}" is not in kebab-case (a-z, 0-9, -): it names a custom property, --ds-icons-${name}.`);
    }
    const { svg, ...variant } = typeof entry === 'string' ? { svg: entry } : entry;
    const unknown = Object.keys(variant).filter(key => !['fill', 'rotate', 'scale'].includes(key));
    if (typeof svg !== 'string' || !NAME.test(svg) || unknown.length) {
      throw new Error(`icons.json: the icon ${name} is the name of an SVG file of scss/engine/icons/, or { "svg": <name>, "fill", "rotate", "scale" }.`);
    }
    return { name, svg, variant };
  });
  if (entries.length === 0) {
    throw new Error('icons.json: no icon.');
  }
  return { manifest, entries };
};

/** The content of scss/engine/variables/_icons.scss. */
export const generate = () => {
  const { manifest, entries } = readManifest();
  const files = fs
    .readdirSync(iconsDir)
    .filter(file => file.endsWith('.svg'))
    .sort();
  const unused = files.filter(file => !entries.some(({ svg }) => `${svg}.svg` === file));
  if (unused.length) {
    throw new Error(`scss/engine/icons/: ${unused.join(', ')} is used by no icon of icons.json: remove it, or map an icon to it.`);
  }

  const lines = entries.map(({ name, svg, variant }) => {
    const file = path.join(iconsDir, `${svg}.svg`);
    if (!files.includes(`${svg}.svg`)) {
      throw new Error(`icons.json: the icon ${name} is ${svg}, but scss/engine/icons/${svg}.svg does not exist: copy it from ${manifest.package} ${manifest.version}.`);
    }
    const tags = parse(fs.readFileSync(file, 'utf8'), file);
    tags[0].attributes = tags[0].attributes.filter(([attribute]) => !DROPPED_ROOT_ATTRIBUTES.includes(attribute));
    applyVariant(tags, variant, name);
    // On two lines, as Prettier writes a value longer than its print width (npm run format:check).
    return `  ${name}:\n    url("${toDataUri(serialize(tags))}"),`;
  });

  return [
    '// *** ICONS *** //',
    `// Generated by scripts/build-icons.mjs (npm run build:icons) from scss/engine/icons/: the SVG files of ${manifest.set} ${manifest.version}`,
    '// (scss/engine/icons/README.md) and icons.json, which maps each icon name to one of them. Do not edit this file: change',
    '// scss/engine/icons/, then run the script.',
    "@use 'sass:map';",
    '',
    '// The licence notice of the icons: a stylesheet writes it, as a /*! */ comment that the compressed output keeps, after the',
    '// custom properties of the icons it draws (ds-tokens(), ds-icon-tokens()).',
    `$icons-notice: '${manifest.notice}';`,
    '',
    '// The icons of the engine: name → image, an SVG data URI.',
    '$-icon-set: (',
    ...lines,
    ');',
    '',
    '// The icons: name → image (an url(), drawn as a mask in the color of the text). A theme adds icons, or replaces some, with',
    "// `@forward '<path to>/scss/engine' with ($icons: (<name>: url(…)))`: they are merged into the icons of the engine.",
    '$icons: () !default;',
    '$icons: map.merge($-icon-set, $icons);',
    '',
  ].join('\n');
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  let flags;
  try {
    ({ values: flags } = parseArgs({ options: { check: { type: 'boolean' } } }));
  } catch (error) {
    console.error(`${error.message}\nUsage: node scripts/build-icons.mjs [--check]`);
    process.exit(2);
  }

  try {
    const content = generate();
    if (flags.check) {
      const current = fs.existsSync(destination) ? fs.readFileSync(destination, 'utf8') : '';
      if (current !== content) {
        console.error(`${relative(destination)} is out of date: run npm run build:icons, and commit it.`);
        process.exitCode = 1;
      } else {
        console.log(`${relative(destination)} is up to date.`);
      }
    } else {
      fs.writeFileSync(destination, content);
      console.log(`scss/engine/icons/ → ${relative(destination)}`);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
