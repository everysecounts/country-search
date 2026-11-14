import { createElement } from '@/utils/createElement';

function createHeader(): {
  element: HTMLElement;
  input: HTMLInputElement;
} {
  const title = createElement('h1', {
    className: 'header__title',
    textContent: 'Country Search',
  });

  const input = createElement('input', {
    className: 'search__input',
    attributes: {
      type: 'search',
      placeholder: 'Search countries...',
      'aria-label': 'Search countries',
      autocomplete: 'off',
    },
  });

  const search = createElement(
    'div',
    {
      className: 'search',
    },
    [
      createElement('span', {
        className: 'search__icon',
        attributes: {
          'aria-hidden': 'true',
        },
      }),
      input,
    ],
  );

  const element = createElement(
    'header',
    {
      className: 'header',
    },
    [title, search],
  );

  return { element, input };
}

export { createHeader };
