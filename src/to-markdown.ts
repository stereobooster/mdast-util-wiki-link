import safe from 'mdast-util-to-markdown/lib/util/safe'

interface ToMarkdownOptions {
  aliasDivider?: string;
}

function toMarkdown (opts: ToMarkdownOptions = {}) {
  const aliasDivider = opts.aliasDivider || ':'

  const unsafe = [
    {
      character: '[',
      inConstruct: ['phrasing', 'label', 'reference']
    },
    {
      character: ']',
      inConstruct: ['label', 'reference']
    }
  ]

  function handler (node: any, _: any, context: any) {
    const exit = context.enter('wikiLink')

    const nodeValue = safe(context, node.value, { before: '[', after: ']' })

    let value
    if (node.data.alias != null) {
      const nodeAlias = safe(context, node.data.alias, { before: '[', after: ']' })
      value = `[[${nodeValue}${aliasDivider}${nodeAlias}]]`
    } else {
      value = `[[${nodeValue}]]`
    }

    exit()

    return value
  }

  return {
    unsafe: unsafe,
    handlers: {
      wikiLink: handler
    }
  }
}

export { toMarkdown }
