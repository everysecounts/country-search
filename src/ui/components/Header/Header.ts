import styles from './header.module.css';
import { createElement } from '@/utils/createElement';
import { createSearchHistory } from '@/ui/components/SearchHistory';

function createHeader(): {
  element: HTMLElement;
  searchSection: HTMLElement;
  input: HTMLInputElement;
  history: HTMLElement;
  historyList: HTMLElement;
  historyClearButton: HTMLButtonElement;
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

  const clearButton = createElement('button', {
    className: styles.clearButton,
    attributes: {
      type: 'button',
      'aria-label': 'Clear search',
      hidden: '',
    },
    textContent: '×',
  });

  clearButton.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  });

  input.addEventListener('input', () => {
    clearButton.hidden = input.value.length === 0;
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
      clearButton,
    ],
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
