import type { CountryCard } from '@/types/country';
import { createCountryCard } from '@/ui/components/CountryCard';
import { createElement } from '@/utils/createElement';
import styles from './search-results.module.css';

function createSearchResults(): HTMLElement {
  return createElement('section', {
    className: styles.results,
    attributes: {
      'aria-label': 'Search results',
      'aria-live': 'polite',
    },
  });
}

function renderCountries(
  container: HTMLElement,
  countries: CountryCard[],
  onSelect: (country: CountryCard) => void,
): void {
  const cards = countries.map((country) => createCountryCard(country, onSelect));
  container.replaceChildren(...cards);
}

function renderMessage(container: HTMLElement, message: string): void {
  const element = createElement('p', {
    className: styles.message,
    textContent: message,
  });

  container.replaceChildren(element);
}

function renderError(container: HTMLElement, message: string, onRetry: () => void): void {
  const errorMessage = createElement('p', {
    className: styles.message,
    textContent: message,
  });

  const retryButton = createElement('button', {
    className: styles.retry,
    textContent: 'Retry',
    attributes: { type: 'button' },
  });

  retryButton.addEventListener('click', onRetry);

  container.replaceChildren(errorMessage, retryButton);
}

export { createSearchResults, renderCountries, renderError, renderMessage };
