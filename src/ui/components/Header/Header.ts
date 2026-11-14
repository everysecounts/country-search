import styles from './header.module.css';
import { createElement } from '@/utils/createElement';

function createHeader(): {
  element: HTMLElement;
  input: HTMLInputElement;
} {
  const title = createElement('h1', {
    className: styles.headerTitle,
    textContent: 'Country Search',
  });

  const input = createElement('input', {
    className: styles.searchInput,
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
      className: styles.search,
    },
    [
      createElement('span', {
        className: styles.searchIcon,
        attributes: { 'aria-hidden': 'true' },
      }),
      input,
    ],
  );

  const element = createElement(
    'header',
    {
      className: styles.header,
    },
    [title, search],
  );

  return { element, input };
}

export { createHeader };
