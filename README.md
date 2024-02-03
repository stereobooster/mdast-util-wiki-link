# @stereobooster/mdast-util-wiki-link

Fork of [mdast-util-wiki-link](https://github.com/landakram/mdast-util-wiki-link) to simplify options.

[![npm version](https://badge.fury.io/js/@stereobooster%2Fmdast-util-wiki-link.svg)](https://badge.fury.io/js/@stereobooster%2Fmdast-util-wiki-link)
[![Build Status](https://github.com/stereobooster/mdast-util-wiki-link/actions/workflows/node.js.yml/badge.svg)](https://github.com/stereobooster/mdast-util-wiki-link/actions/workflows/node.js.yml)

Extension for [`mdast-util-from-markdown`](https://github.com/syntax-tree/mdast-util-from-markdown) and
[`mdast-util-to-markdown`](https://github.com/syntax-tree/mdast-util-to-markdown) to support `[[Wiki Links]]`.

* Parse wiki-style links and render them as anchors
* Parse aliased wiki links i.e `[[Real Page:Page Alias]]`

Using [remark](https://github.com/remarkjs/remark)? You might want to use 
[`@stereobooster/remark-wiki-link`](https://github.com/stereobooster/remark-wiki-link) instead of using this package directly.

## Usage

### Markdown to AST

```javascript
import fromMarkdown from 'mdast-util-from-markdown'
import { syntax } from 'micromark-extension-wiki-link'
import * as wikiLink from 'mdast-util-wiki-link'

let ast = fromMarkdown('[[Test Page]]', {
  extensions: [syntax()],
  mdastExtensions: [wikiLink.fromMarkdown()]
})
```

The AST node will look like this:

```javascript
{
    value: 'Test Page',
    data: {
        alias: 'Test Page',
        permalink: 'Test Page',
        hName: 'a',
        hProperties: {
            href: 'Test Page'
        },
        hChildren: [{
            type: 'text',
            value: 'Test Page'
        }]
    }
}
```

* `data.alias`: The display name for this link
* `data.permalink`: The permalink for this page. This permalink is computed from `node.value` using `options.linkResolver`, which can be passed in when initializing the plugin. 
* `data.h...`: provide compatibility with [`rehype`](https://github.com/rehypejs/rehype). Computed from `data` using `options.linkTemplate`

### AST to Markdown

Taking the `ast` from the prior example, let's go back to markdown:

```javascript
import { fromMarkdown } from 'mdast-util-from-markdown'
import * as wikiLink from 'mdast-util-wiki-link'

let markdownString = toMarkdown(ast, { extensions: [wikiLink.toMarkdown()] }).trim()
console.log(markdownString)
// [[Wiki Link]]
```

### Configuration options

Both `fromMarkdown` and `toMarkdown` accept configuration as an object.

For example, one may configure `fromMarkdown` like so:

```javascript
let ast = fromMarkdown('[[Test Page]]', {
  extensions: [syntax()],
  mdastExtensions: [wikiLink.fromMarkdown({ linkResolver: (x) => x })] // <--
})
```

#### `fromMarkdown`

* `options.linkResolver (pageName: String) -> String`: A function that maps a page name to a permalink. 
* `options.linkTemplate (opts: { permalink: string, alias: string }) -> hast`: A function that creates hast representation of wiki link. Default value is:

```ts
function defaultLinkTemplate ({ permalink, alias }: LinkTemplateProps) {
  return {
    hName: 'a',
    hProperties: { href: permalink },
    hChildren: [{ type: 'text', value: alias }]
  }
}
```

#### `toMarkdown`

* `options.aliasDivider [String]`: a string to be used as the divider for aliases. See the section below on [Aliasing pages](#aliasing-pages). Defaults to `":"`.

### Aliasing pages

Aliased pages are supported with the following markdown syntax: 

```
[[Real Page:Page Alias]]
```

And will produce this HTML when rendered:

```html
<a href="Real Page">Page Alias</a>
```
