import { createElement } from '@/utils/createElement';

function createSearchResults(): HTMLElement {
  return createElement('section', {
    className: 'results',
    attributes: {
      'aria-label': 'Search results',
    },
  });
}

export { createSearchResults };
