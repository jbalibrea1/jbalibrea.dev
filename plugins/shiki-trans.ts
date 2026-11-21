import type { transformerNotationDiff } from '@shikijs/transformers';
import { h } from 'hastscript';

// Tipo del transformer de Shiki (shiki no es dependencia directa)
type ShikiTransformer = ReturnType<typeof transformerNotationDiff>;

// Nest a div in the outer layer
export const updateStyle = (): ShikiTransformer => {
  return {
    name: 'shiki-transformer-update-style',
    pre(node) {
      const container = h('pre', node.children);
      node.children = [container];
      node.tagName = 'div';
      // El código no se indexa en el buscador: los extractos salían como
      // texto aplanado ilegible (p. ej. "## Encabezado 2 ### Encabezado 3 …")
      node.properties['data-pagefind-ignore'] = 'all';
    },
  };
};

export const addCopyButton = (timeout?: number): ShikiTransformer => {
  const toggleMs = timeout || 3000;

  return {
    name: 'shiki-transformer-copy-button',
    pre(node) {
      const button = h(
        'button',
        {
          class: 'copy  p-1 box-content border rounded ',
          'data-code': this.source,
          onclick: `
          navigator.clipboard.writeText(this.dataset.code);
          this.classList.add('copied');
          setTimeout(() => this.classList.remove('copied'), ${toggleMs})
        `,
        },
        [
          h('div', { class: 'ready' }, [
            h(
              'svg',
              {
                class: 'size-5',
              },
              [
                h('use', {
                  href: '/icons/code.svg#mingcute-clipboard-line',
                }),
              ],
            ),
          ]),
          h('div', { class: 'success hidden' }, [
            h(
              'svg',
              {
                class: 'size-5',
              },
              [
                h('use', {
                  href: '/icons/code.svg#mingcute-file-check-line',
                }),
              ],
            ),
          ]),
        ],
      );

      node.children.push(button);
    },
  };
};
