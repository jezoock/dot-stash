# Icons

The icons of the engine: SVG files of [Lucide](https://lucide.dev) 1.60.0, an open-licence icon set of 24 × 24 stroke icons, copied unchanged from the `icons/` folder of its npm package, `lucide-static`, with its licence, [`LICENSE`](LICENSE) (ISC License; the icons derived from Feather: MIT License). Only the files the icons use are here: the library does not depend on the package, nor on any service, and the icons are drawn from the compiled stylesheet itself (SVG data URIs).

- `*.svg`: the icon files, as the package has them (each keeps its `@license` comment).
- `icons.json`: the icon set (`set`, `package`, `version`), the licence notice that the compiled stylesheets keep (`notice`), and `icons`, which maps each icon name of the engine to an SVG file.
- `LICENSE`: the licence of the icon set, a copy of the one of the package. `npm run build:css` copies it next to the compiled stylesheets, to `dist/css/LICENSE-icons.txt` (the published package holds `dist/`, not `scss/`), and the licence notice of the stylesheets names that file.

`scripts/build-icons.mjs` (`npm run build:icons`) generates `scss/engine/variables/_icons.scss` from them: `$icons`, each name with its SVG as a data URI. It keeps the elements and attributes of each file, without its comments, the whitespace between the tags, and the `class`, `width` and `height` of its root element (the viewBox stays), and fails on anything that is not part of an icon (a script, a style, a link, a text). The generated file is committed; `npm test` and CI (`npm run build:icons -- --check`) fail when it is not the one the script generates.

## icons.json

An entry of `icons` is the name of an SVG file of this folder, without `.svg` (`"ok": "check"`), or an object, for a variant made by the script (the SVG files stay unchanged):

- `"svg"`: the SVG file;
- `"fill"`: `true`, the whole icon filled (a solid shape: `heart` is the filled `heart.svg`, `heart-empty` the file as it is), or the list of the positions of the shapes to fill (`[1]`, the first one: the front bubble of `chat`);
- `"rotate"`: `90`, `180` or `270`, degrees clockwise around the center (`quote-left` is `quote.svg` rotated 180°);
- `"scale"`: a factor below 1, to draw the icon smaller in its box (the triangles of the `*-dir` icons, as small as a caret).

The names are in kebab-case (`a-z`, `0-9`, `-`): each one names a custom property, `--ds-icons-<name>`.

## Adding an icon

1. Find the icon on [lucide.dev](https://lucide.dev/icons/), and copy its SVG file from the `icons/` folder of the `lucide-static` package of the same version (`npm pack lucide-static@1.60.0`, then extract the file from the tarball; do not install the package) into this folder, unchanged.
2. Add its name to `icons` in `icons.json`: `"<name>": "<file>"`, or an object for a variant.
3. Run `npm run build:icons`, and commit the SVG file, `icons.json` and `scss/engine/variables/_icons.scss`.

`@include ds-icon(<name>)` then draws it. A theme writes the image of an icon only when one of its skins draws it: an icon added to the engine costs nothing to the stylesheets that do not use it. A theme can also add an icon of its own, or replace one, without changing this folder: `$icons` of the engine (see [Icons](../../../README.md#icons) in the README).

To update the set, copy the files of the icons of `icons.json` from the new version of the package, change `version` and `notice` (and `LICENSE`, if it changed), run the script and look at the icons (a page with every icon, at the size of the text).

## The icons

The names are those of the former icon font of the library, each mapped to the icon of the set that has its meaning, then the icons added since, at the end of the table (`ok-circle`, `spinner`, `ellipsis`). A filled icon and its outline (`heart`, `heart-empty`) are two variants of the same file. Some names have an approximate icon: the set has no icon of that exact shape.

| Name                 | Lucide icon            | Variant                         | Note                                                                    |
| -------------------- | ---------------------- | ------------------------------- | ----------------------------------------------------------------------- |
| `basket`             | `shopping-cart`        |                                 | a shopping cart (the `cart` type of `ds-icon`)                          |
| `ok`                 | `check`                |                                 |                                                                         |
| `cancel`             | `x`                    |                                 |                                                                         |
| `right-open`         | `chevron-right`        |                                 | the same icon as `angle-right`                                          |
| `user`               | `user`                 | filled                          | filled, `user-o` its outline                                            |
| `search`             | `search`               |                                 |                                                                         |
| `mail`               | `mail`                 |                                 |                                                                         |
| `heart-empty`        | `heart`                |                                 |                                                                         |
| `heart`              | `heart`                | filled                          | filled, `heart-empty` its outline                                       |
| `star`               | `star`                 | filled                          | filled, `star-empty` its outline                                        |
| `star-empty`         | `star`                 |                                 |                                                                         |
| `minus`              | `minus`                |                                 |                                                                         |
| `plus`               | `plus`                 |                                 |                                                                         |
| `home`               | `house`                |                                 |                                                                         |
| `link`               | `link`                 |                                 |                                                                         |
| `lock`               | `lock`                 |                                 |                                                                         |
| `eye-off`            | `eye-off`              |                                 |                                                                         |
| `eye`                | `eye`                  |                                 |                                                                         |
| `thumbs-up`          | `thumbs-up`            |                                 |                                                                         |
| `thumbs-down`        | `thumbs-down`          |                                 |                                                                         |
| `pencil`             | `pencil`               |                                 |                                                                         |
| `comment`            | `message-circle`       | filled                          | filled, `comment-empty` its outline                                     |
| `chat`               | `messages-square`      | shape 1 filled                  | the front bubble filled, `chat-empty` its outline                       |
| `bell`               | `bell`                 |                                 |                                                                         |
| `attention`          | `triangle-alert`       |                                 |                                                                         |
| `location`           | `map-pin`              |                                 |                                                                         |
| `folder`             | `folder`               | filled                          | filled, `folder-empty` its outline                                      |
| `folder-open`        | `folder-open`          | filled                          | filled (the flap is not drawn), `folder-open-empty` its outline         |
| `cog`                | `settings`             |                                 |                                                                         |
| `right-big`          | `arrow-big-right`      |                                 |                                                                         |
| `right-hand`         | `pointer`              | rotated 90°                     | approximate: the pointing hand of the set points up, rotated            |
| `cw`                 | `rotate-cw`            |                                 |                                                                         |
| `arrows-cw`          | `refresh-cw`           |                                 |                                                                         |
| `play`               | `play`                 |                                 |                                                                         |
| `stop`               | `square`               |                                 |                                                                         |
| `pause`              | `pause`                |                                 |                                                                         |
| `to-end`             | `skip-forward`         |                                 |                                                                         |
| `to-end-alt`         | `chevron-last`         |                                 | approximate: a chevron and a bar (the font: two triangles and a bar)    |
| `fast-fw`            | `fast-forward`         |                                 |                                                                         |
| `eject`              | `eject`                |                                 |                                                                         |
| `down-dir`           | `triangle`             | filled, rotated 180°, scale 0.6 | a small filled triangle (a caret)                                       |
| `phone`              | `phone`                |                                 |                                                                         |
| `left-dir`           | `triangle`             | filled, rotated 270°, scale 0.6 | a small filled triangle (a caret)                                       |
| `down-open`          | `chevron-down`         |                                 | the same icon as `angle-down`                                           |
| `cog-alt`            | `cog`                  |                                 | approximate: one cog (the font: two cogs)                               |
| `block`              | `ban`                  |                                 |                                                                         |
| `down-big`           | `arrow-big-down`       |                                 |                                                                         |
| `up-dir`             | `triangle`             | filled, scale 0.6               | a small filled triangle (a caret)                                       |
| `right-dir`          | `triangle`             | filled, rotated 90°, scale 0.6  | a small filled triangle (a caret)                                       |
| `left-open`          | `chevron-left`         |                                 | the same icon as `angle-left`                                           |
| `up-open`            | `chevron-up`           |                                 | the same icon as `angle-up`                                             |
| `left-big`           | `arrow-big-left`       |                                 |                                                                         |
| `up-big`             | `arrow-big-up`         |                                 |                                                                         |
| `ccw`                | `rotate-ccw`           |                                 |                                                                         |
| `calendar`           | `calendar`             |                                 |                                                                         |
| `login`              | `log-in`               |                                 |                                                                         |
| `logout`             | `log-out`              |                                 |                                                                         |
| `attach`             | `paperclip`            |                                 |                                                                         |
| `credit-card`        | `credit-card`          |                                 |                                                                         |
| `barcode`            | `barcode`              |                                 |                                                                         |
| `off`                | `power`                |                                 |                                                                         |
| `truck`              | `truck`                |                                 |                                                                         |
| `videocam`           | `video`                |                                 |                                                                         |
| `picture`            | `image`                |                                 |                                                                         |
| `doc`                | `file`                 |                                 |                                                                         |
| `certificate`        | `certificate`          |                                 | a certificate with a rosette (the font: a seal)                         |
| `docs`               | `files`                |                                 |                                                                         |
| `menu`               | `menu`                 |                                 |                                                                         |
| `comment-empty`      | `message-circle`       |                                 |                                                                         |
| `chat-empty`         | `messages-square`      |                                 |                                                                         |
| `download-cloud`     | `cloud-download`       |                                 |                                                                         |
| `upload-cloud`       | `cloud-upload`         |                                 |                                                                         |
| `bell-alt`           | `bell`                 | filled                          | filled, `bell` its outline                                              |
| `angle-double-left`  | `chevrons-left`        |                                 |                                                                         |
| `angle-double-right` | `chevrons-right`       |                                 |                                                                         |
| `angle-double-up`    | `chevrons-up`          |                                 |                                                                         |
| `angle-double-down`  | `chevrons-down`        |                                 |                                                                         |
| `angle-left`         | `chevron-left`         |                                 |                                                                         |
| `angle-right`        | `chevron-right`        |                                 |                                                                         |
| `angle-up`           | `chevron-up`           |                                 |                                                                         |
| `angle-down`         | `chevron-down`         |                                 |                                                                         |
| `quote-left`         | `quote`                | rotated 180°                    | the closing quotes of `quote-right`, rotated: opening quotes            |
| `quote-right`        | `quote`                |                                 |                                                                         |
| `folder-empty`       | `folder`               |                                 |                                                                         |
| `folder-open-empty`  | `folder-open`          |                                 |                                                                         |
| `help`               | `circle-question-mark` |                                 | approximate: a question mark in a circle (the font: the mark alone)     |
| `info`               | `info`                 |                                 | approximate: an i in a circle (the font: the letter alone)              |
| `attention-alt`      | `circle-alert`         |                                 | approximate: an exclamation mark in a circle (the font: the mark alone) |
| `ticket`             | `ticket`               |                                 |                                                                         |
| `thumbs-up-alt`      | `thumbs-up`            | filled                          | filled, `thumbs-up` its outline                                         |
| `thumbs-down-alt`    | `thumbs-down`          | filled                          | filled, `thumbs-down` its outline                                       |
| `down`               | `move-down`            |                                 | a long arrow                                                            |
| `up`                 | `move-up`              |                                 | a long arrow                                                            |
| `left`               | `move-left`            |                                 | a long arrow                                                            |
| `right`              | `move-right`           |                                 | a long arrow                                                            |
| `sliders`            | `sliders-horizontal`   |                                 |                                                                         |
| `trash`              | `trash`                |                                 |                                                                         |
| `user-o`             | `user`                 |                                 |                                                                         |
| `ok-circle`          | `circle-check`         |                                 | added: a check in a circle (a success, `ds-alert`)                      |
| `spinner`            | `loader-circle`        |                                 | added: an open circle, which turns (a loading indicator, `ds-loader`)   |
| `ellipsis`           | `ellipsis`             |                                 | added: three dots in a row (`ds-breadcrumb`, `ds-pagination`)           |
