import { createHeader } from '@/ui/components/Header';
import { createMain } from '@/ui/components/Main';
import { renderCountries, renderError, renderMessage } from '@/ui/components/SearchResults';
import { renderCountryDetails } from '@/ui/components/CountryDetails';
import type { CountryCard } from '@/types/country';
import type { SearchState } from '@/types/searchController';
import { createSearchController } from '@/utils/searchController';

function createApp(root: HTMLElement): void {
  const { element: header, input } = createHeader();
  const { element: main, results, details } = createMain();

  const controller = createSearchController(renderState);

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
      renderMessage(results, 'Searching...');
      return;
    }

    if (state.status === 'success') {
      renderCountries(results, state.countries, selectCountry);
      return;
    }

    if (state.status === 'empty') {
      renderMessage(results, 'No countries found.');
      details.replaceChildren();
      return;
    }

    const errorMessages = {
      timeout: 'The request timed out. Please try again.',
      http: 'The server returned an error. Please try again.',
      network: 'Network error. Check your connection and try again.',
      abort: '',
    };

    renderError(results, errorMessages[state.errorType ?? 'network'], () => controller.retry());
    details.replaceChildren();
  }

  input.addEventListener('input', () => {
    controller.onQueryChange(input.value);
  });

  root.replaceChildren(header, main);
}

export { createApp };
