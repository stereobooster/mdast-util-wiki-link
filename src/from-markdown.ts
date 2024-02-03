type LinkTemplateProps = {
  permalink: string,
  alias: string
}

function defaultLinkTemplate ({ permalink, alias }: LinkTemplateProps): any {
  return {
    hName: 'a',
    hProperties: { href: permalink },
    hChildren: [{ type: 'text', value: alias }]
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
        alias: null,
        permalink: null
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
      permalink: opts.linkResolver
        ? opts.linkResolver(wikiLink.value)
        : wikiLink.value,
      alias: wikiLink.data.alias || wikiLink.value
    }

    wikiLink.data = {
      ...wikiLink.data,
      ...data,
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
