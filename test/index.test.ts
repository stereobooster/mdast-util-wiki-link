import assert from 'assert'

import { fromMarkdown } from 'mdast-util-from-markdown'
import toMarkdown from 'mdast-util-to-markdown'
import visit from 'unist-util-visit'
import { Node, Data } from 'unist'

import { syntax } from 'micromark-extension-wiki-link'

import * as wikiLink from '../src'

interface WikiLinkHProperties {
  className: string;
  href: string;
  [key: string]: unknown;
}

interface WikiLinkData extends Data {
  permalink: string;
  hProperties: WikiLinkHProperties;
  hChildren: Array<{value: string}>
}

interface WikiLinkNode extends Node {
  data: WikiLinkData;
}

function assertWikiLink(obj: Node): asserts obj is WikiLinkNode {
  if (!obj.data || obj.data.permalink === undefined) {
    throw new Error('Not a wiki link')
  }
}

describe('mdast-util-wiki-link', () => {
  describe('fromMarkdown', () => {
    test('parses a wiki link', () => {
      const ast = fromMarkdown('[[Wiki Link]]', {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLink.fromMarkdown()
        ]
      })

      visit(ast, 'wikiLink', (node: Node) => {
        assertWikiLink(node)
        assert.equal(node.data.permalink, 'Wiki Link')
        assert.equal(node.data.hName, 'a')
        assert.equal(node.data.hProperties.href, 'Wiki Link')
        assert.equal(node.data.hChildren[0].value, 'Wiki Link')
      })
    })

    test('handles wiki links with aliases', () => {
      const ast = fromMarkdown('[[Real Page:Page Alias]]', {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLink.fromMarkdown()
        ]
      })

      visit(ast, 'wikiLink', (node: Node) => {
        assertWikiLink(node)
        assert.equal(node.data.permalink, 'Real Page')
        assert.equal(node.data.alias, 'Page Alias')
        assert.equal(node.value, 'Real Page')
        assert.equal(node.data.hName, 'a')
        assert.equal(node.data.hProperties.href, 'Real Page')
        assert.equal(node.data.hChildren[0].value, 'Page Alias')
      })
    })

    describe('configuration options', () => {
      test('uses linkResolver', () => {
        const ast = fromMarkdown('[[A Page]]', {
          extensions: [syntax()],
          mdastExtensions: [
            wikiLink.fromMarkdown({
              linkResolver: (x) => x.toLowerCase().replace(' ', '_')
            })
          ]
        })

        visit(ast, 'wikiLink', (node: Node) => {
          assertWikiLink(node)
          assert.equal(node.data.permalink, 'a_page')
          assert.equal(node.data.hProperties.href, 'a_page')
        })
      })

      test('uses linkTemplate', () => {
        const ast = fromMarkdown('[[A Page]]', {
          extensions: [syntax()],
          mdastExtensions: [
            wikiLink.fromMarkdown({
              linkTemplate: ({ permalink, alias }) => ({
                hName: 'span',
                hProperties: { 'data-href': permalink },
                hChildren: [{ type: 'text', value: alias }]
              })
            })
          ]
        })

        visit(ast, 'wikiLink', (node: Node) => {
          assertWikiLink(node)
          assert.equal(node.data.hName, 'span')
          assert.equal(node.data.hProperties['data-href'], 'A Page')
          assert.equal(node.data.hChildren[0].value, 'A Page')
        })
      })
    })
  })

  describe('toMarkdown', () => {
    test('stringifies wiki links', () => {
      const ast = fromMarkdown('[[Wiki Link]]', {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLink.fromMarkdown()
        ]
      })

      const stringified = toMarkdown(ast, { extensions: [wikiLink.toMarkdown()] }).trim()

      assert.equal(stringified, '[[Wiki Link]]')
    })

    test('stringifies aliased wiki links', () => {
      const ast = fromMarkdown('[[Real Page:Page Alias]]', {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLink.fromMarkdown()
        ]
      })

      const stringified = toMarkdown(ast, { extensions: [wikiLink.toMarkdown()] }).trim()

      assert.equal(stringified, '[[Real Page:Page Alias]]')
    })

    describe('configuration options', () => {
      test('uses aliasDivider', () => {
        const ast = fromMarkdown('[[Real Page:Page Alias]]', {
          extensions: [syntax()],
          mdastExtensions: [
            wikiLink.fromMarkdown()
          ]
        })

        const stringified = toMarkdown(ast, {
          extensions: [
            wikiLink.toMarkdown({ aliasDivider: '|' })
          ]
        }).trim()

        assert.equal(stringified, '[[Real Page|Page Alias]]')
      })
    })
  })
})
