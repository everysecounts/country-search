import type { CountryCard as CountryCardData } from '@/types/country';
import { createElement } from '@/utils/createElement';
import styles from './country-card.module.css';

function createCountryCard(
  country: CountryCardData,
  onSelect: (country: CountryCardData) => void,
): HTMLElement {
  const flag = createElement('span', {
    className: styles.flag,
    textContent: country.flag,
    attributes: { 'aria-hidden': 'true' },
  });

  const name = createElement('h2', {
    className: styles.name,
    textContent: country.name,
  });

  const capital = createElement('span', {
    className: styles.capital,
    textContent: country.capital,
  });

  const region = createElement('span', {
    className: styles.region,
    textContent: country.region,
  });

  const population = createElement('span', {
    className: styles.population,
    textContent: country.population.toLocaleString('en-US'),
  });

  const info = createElement('div', { className: styles.info }, [name, capital]);

  const card = createElement(
    'button',
    {
      className: styles.card,
      attributes: {
        type: 'button',
        'aria-label': `Show details for ${country.name}`,
      },
    },
    [flag, info, region, population],
  );

  card.addEventListener('click', () => {
    onSelect(country);
  });

  return card;
}

export { createCountryCard };
