import { createElement } from '@/utils/createElement';

function createCountryDetails(): HTMLElement {
  return createElement('aside', {
    className: 'details',
    attributes: {
      'aria-label': 'Country details',
      hidden: '',
    },
  });
}

export { createCountryDetails };
