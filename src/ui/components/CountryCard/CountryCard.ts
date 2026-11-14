import type { CountryCard as CountryCardData } from '@/types/country';
import { createElement } from '@/utils/createElement';
import styles from './country-card.module.css';

function createCountryCard(country: CountryCardData): HTMLElement {
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

  return createElement('article', { className: styles.card }, [flag, info, region, population]);
}

export { createCountryCard };
