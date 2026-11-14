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

function createInfoItem(label: string, value: string): HTMLElement {
  const title = createElement('span', {
    className: styles.infoLabel,
    textContent: label,
  });

  const content = createElement('span', {
    className: styles.infoValue,
    textContent: value,
  });

  return createElement(
    'div',
    {
      className: styles.infoItem,
    },
    [title, content],
  );
}

function createTagList(label: string, values: string[], emptyMessage: string): HTMLElement {
  const title = createElement('h3', {
    className: styles.sectionTitle,
    textContent: label,
  });

  const tags = values.length
    ? values.map((value) =>
        createElement('span', {
          className: styles.tag,
          textContent: value,
        }),
      )
    : [
        createElement('span', {
          className: styles.emptyValue,
          textContent: emptyMessage,
        }),
      ];

  const list = createElement(
    'div',
    {
      className: styles.tags,
    },
    tags,
  );

  return createElement(
    'section',
    {
      className: styles.section,
    },
    [title, list],
  );
}

function renderCountryDetails(container: HTMLElement, country: CountryCard): void {
  const flag = createElement('img', {
    className: styles.flag,
    attributes: {
      src: country.flag,
      alt: `${country.name} flag`,
      loading: 'lazy',
    },
  });

  const name = createElement('h2', {
    className: styles.name,
    textContent: country.name,
  });

  const heading = createElement(
    'div',
    {
      className: styles.heading,
    },
    [flag, name],
  );

  const overview = createElement(
    'section',
    {
      className: styles.overview,
    },
    [
      createInfoItem('Capital', country.capital || 'Unknown'),
      createInfoItem('Region', country.region || 'Unknown'),
      createInfoItem('Subregion', country.subregion || 'Unknown'),
    ],
  );

  const statistics = createElement(
    'section',
    {
      className: styles.statistics,
    },
    [
      createInfoItem('Population', country.population.toLocaleString('en-US')),
      createInfoItem(
        'Area',
        country.area !== undefined ? `${country.area.toLocaleString('en-US')} km²` : 'Unknown',
      ),
    ],
  );
  const currencies = country.currencies.map(
    ({ code, name: currencyName, symbol }) => `${currencyName} (${code}) ${symbol}`,
  );
  const currencySection = createTagList('Currencies', currencies, 'No currency information');
  const languageSection = createTagList('Languages', country.languages, 'No language information');
  const borderSection = createTagList('Border countries', country.borders, 'No land borders');

  container.replaceChildren(
    heading,
    overview,
    statistics,
    currencySection,
    languageSection,
    borderSection,
  );
}

export { createCountryDetails, renderCountryDetails };
