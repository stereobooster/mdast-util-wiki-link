type LinkTemplateProps = {
  slug: string,
  permalink?: string,
  alias?: string
}

function defaultLinkTemplate ({ slug, permalink, alias }: LinkTemplateProps): any {
  return {
    hName: 'a',
    hProperties: { href: permalink == null ? slug : permalink },
    hChildren: [{ type: 'text', value: alias == null ? slug : alias }]
  }
}

interface FromMarkdownOptions {
  linkResolver?: (x: string) => string
  linkTemplate?: typeof defaultLinkTemplate
}

function fromMarkdown (opts: FromMarkdownOptions = {}) {
  const linkTemplate = opts.linkTemplate || defaultLinkTemplate
  let node: any

  function enterWikiLink (this: any, token: any) {
    node = {
      type: 'wikiLink',
      value: null,
      data: {
        // alias: null,
        // permalink: null
      }
    }
    this.enter(node, token)
  }

  function top (stack: any) {
    return stack[stack.length - 1]
  }

  function exitWikiLinkAlias (this: any, token: any) {
    const alias = this.sliceSerialize(token)
    const current = top(this.stack)
    current.data.alias = alias
  }

  function exitWikiLinkTarget (this: any, token: any) {
    const target = this.sliceSerialize(token)
    const current = top(this.stack)
    current.value = target
  }

  function exitWikiLink (this: any, token: any) {
    this.exit(token)
    const wikiLink = node

    const data = {
      slug: wikiLink.value,
      alias: wikiLink.data.alias,
      permalink: opts.linkResolver
        ? opts.linkResolver(wikiLink.value)
        : undefined
    }

    wikiLink.data = {
      // ...wikiLink.data,
      alias: data.alias,
      permalink: data.permalink,
      ...linkTemplate(data)
    }
  }

  return {
    enter: {
      wikiLink: enterWikiLink
    },
    exit: {
      wikiLinkTarget: exitWikiLinkTarget,
      wikiLinkAlias: exitWikiLinkAlias,
      wikiLink: exitWikiLink
    }
  }
}

export { fromMarkdown }
