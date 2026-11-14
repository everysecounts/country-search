import { createHeader } from '@/ui/components/Header';
import { createMain } from '@/ui/components/Main';
import {
  renderCountries,
  renderError,
  renderLoading,
  renderMessage,
} from '@/ui/components/SearchResults';
import { renderCountryDetails } from '@/ui/components/CountryDetails';
import { renderSearchHistory } from '@/ui/components/SearchHistory';
import type { CountryCard } from '@/types/country';
import type { SearchState } from '@/types/searchController';
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory,
  removeSearchHistory,
} from '@/utils/searchHistory';
import { createSearchController } from '@/utils/searchController';

function createApp(root: HTMLElement): void {
  const {
    element: header,
    searchSection,
    input,
    history,
    historyList,
    historyClearButton,
  } = createHeader();

  const { element: main, results, details } = createMain();

  const controller = createSearchController(renderState);

  function updateHistory(queries: string[]): void {
    renderSearchHistory(history, historyList, queries, selectHistoryQuery, removeHistoryItem);
  }

  function showHistory(): void {
    history.hidden =
      document.activeElement !== input ||
      input.value.trim().length > 0 ||
      historyList.childElementCount === 0;
  }

  function removeHistoryItem(query: string): void {
    updateHistory(removeSearchHistory(query));
    showHistory();
    input.focus();
  }

  function clearHistory(): void {
    clearSearchHistory();
    updateHistory([]);
    history.hidden = true;
    input.focus();
  }

  function selectHistoryQuery(query: string): void {
    input.value = query;
    history.hidden = true;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  }

  function selectCountry(country: CountryCard): void {
    renderCountryDetails(details, country);
    details.hidden = false;
  }

  function renderState(state: SearchState): void {
    main.hidden = state.status === 'idle';
    details.hidden = true;

    if (state.status === 'idle') {
      results.replaceChildren();
      details.replaceChildren();
      return;
    }

    if (state.status === 'loading') {
      renderLoading(results);
      return;
    }

    if (state.status === 'success') {
      updateHistory(addSearchHistory(state.query));
      renderCountries(results, state.countries, selectCountry);
      return;
    }

    if (state.status === 'empty') {
      updateHistory(addSearchHistory(state.query));
      renderMessage(results, 'No countries found.');
      details.replaceChildren();
      return;
    }

    updateHistory(addSearchHistory(state.query));

    const errorMessages = {
      timeout: 'The request timed out. Please try again.',
      http: 'The server returned an error. Please try again.',
      network: 'Network error. Check your connection and try again.',
      abort: '',
    };

    renderError(results, errorMessages[state.errorType ?? 'network'], () => controller.retry());

    details.replaceChildren();
  }

  input.addEventListener('focus', showHistory);

  input.addEventListener('input', () => {
    controller.onQueryChange(input.value);
    showHistory();
  });

  input.addEventListener('blur', (event: FocusEvent) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && history.contains(nextTarget)) {
      return;
    }

    history.hidden = true;
  });

  historyClearButton.addEventListener('click', clearHistory);

  document.addEventListener('pointerdown', (event: PointerEvent) => {
    const target = event.target;

    if (target instanceof Node && !searchSection.contains(target)) {
      history.hidden = true;
    }
  });

  updateHistory(getSearchHistory());

  root.replaceChildren(header, main);
}

export { createApp };
