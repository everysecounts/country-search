import type { CountryCard } from '@/types/country';
import { createElement } from '@/utils/createElement';
import styles from './country-details.module.css';

function createCountryDetails(): HTMLElement {
  return createElement('aside', {
    className: styles.details,
    attributes: {
      'aria-label': 'Country details',
      hidden: '',
    },
  });
}

function renderCountryDetails(container: HTMLElement, country: CountryCard): void {
  const flag = createElement('img', {
    className: styles.flag,
    attributes: {
      src: country.flag,
      alt: `${country.name} flag`,
    },
  });

  const name = createElement('h2', {
    className: styles.name,
    textContent: country.name,
  });

  const capital = createElement('p', {
    className: styles.field,
    textContent: `Capital: ${country.capital}`,
  });

  const region = createElement('p', {
    className: styles.field,
    textContent: `Region: ${country.region}`,
  });

  const population = createElement('p', {
    className: styles.field,
    textContent: `Population: ${country.population.toLocaleString('en-US')}`,
  });

  const languages = createElement('p', {
    className: styles.field,
    textContent: `Languages: ${country.languages.join(', ') || 'Unknown'}`,
  });

  const heading = createElement(
    'div',
    {
      className: styles.heading,
    },
    [flag, name],
  );

  container.replaceChildren(heading, capital, region, population, languages);
}

export { createCountryDetails, renderCountryDetails };
