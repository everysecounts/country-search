import type { SearchHistoryElements } from '@/types/searchHistory';
import { createElement } from '@/utils/createElement';
import styles from './search-history.module.css';

function createSearchHistory(): SearchHistoryElements {
  const title = createElement('h2', {
    className: styles.title,
    textContent: 'Recent searches',
  });

  const clearButton = createElement('button', {
    className: styles.clearButton,
    textContent: 'Clear all',
    attributes: {
      type: 'button',
      'aria-label': 'Clear all search history',
    },
  });

  const heading = createElement(
    'div',
    {
      className: styles.heading,
    },
    [title, clearButton],
  );

  const list = createElement('div', {
    className: styles.list,
    attributes: {
      role: 'group',
      'aria-label': 'Recent searches',
    },
  });

  const element = createElement(
    'section',
    {
      className: styles.history,
      attributes: {
        'aria-label': 'Search history',
        hidden: '',
      },
    },
    [heading, list],
  );

  return { element, list, clearButton };
}

function renderSearchHistory(
  container: HTMLElement,
  list: HTMLElement,
  queries: string[],
  onSelect: (query: string) => void,
  onRemove: (query: string) => void,
): void {
  if (queries.length === 0) {
    container.hidden = true;
    list.replaceChildren();
    return;
  }

  const items = queries.map((query) => {
    const selectButton = createElement('button', {
      className: styles.itemButton,
      textContent: query,
      attributes: {
        type: 'button',
        title: `Search for ${query}`,
      },
    });

    const removeButton = createElement('button', {
      className: styles.removeButton,
      textContent: '×',
      attributes: {
        type: 'button',
        'aria-label': `Remove ${query} from search history`,
        title: `Remove ${query}`,
      },
    });

    const item = createElement(
      'div',
      {
        className: styles.item,
      },
      [selectButton, removeButton],
    );

    selectButton.addEventListener('click', () => onSelect(query));
    removeButton.addEventListener('click', () => onRemove(query));

    return item;
  });

  list.replaceChildren(...items);
}

export { createSearchHistory, renderSearchHistory };
