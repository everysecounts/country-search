import type { HeaderElements } from '@/types/header';
import styles from './header.module.css';
import { createElement } from '@/utils/createElement';
import { createSearchHistory } from '@/ui/components/SearchHistory';

function createHeader(): HeaderElements {
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

  const focusInput = (): void => {
    if (document.activeElement !== input) {
      input.focus();
    }
  };

  const searchIcon = createElement('span', {
    className: styles.searchIcon,
    attributes: {
      'aria-hidden': 'true',
    },
  });

  searchIcon.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });

  searchIcon.addEventListener('click', focusInput);

  const clearButton = createElement('button', {
    className: styles.clearButton,
    attributes: {
      type: 'button',
      'aria-label': 'Clear search',
      hidden: '',
    },
    textContent: '×',
  });

  clearButton.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });

  clearButton.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    focusInput();
  });

  input.addEventListener('input', () => {
    clearButton.hidden = input.value.length === 0;
  });

  const search = createElement(
    'div',
    {
      className: styles.search,
    },
    [searchIcon, input, clearButton],
  );

  const {
    element: history,
    list: historyList,
    clearButton: historyClearButton,
  } = createSearchHistory();

  const searchSection = createElement(
    'div',
    {
      className: styles.searchSection,
    },
    [search, history],
  );

  const element = createElement(
    'header',
    {
      className: styles.header,
    },
    [title, searchSection],
  );

  return {
    element,
    searchSection,
    input,
    history,
    historyList,
    historyClearButton,
  };
}

export { createHeader };
