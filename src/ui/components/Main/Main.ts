import type { MainElements } from '@/types/main';
import { createCountryDetails } from '@/ui/components/CountryDetails';
import { createSearchResults } from '@/ui/components/SearchResults';
import { createElement } from '@/utils/createElement';
import styles from './main.module.css';

function createMain(): MainElements {
  const results = createSearchResults();
  const details = createCountryDetails();

  const element = createElement(
    'main',
    {
      className: styles.main,
      attributes: { hidden: '' },
    },
    [results, details],
  );

  return { element, results, details };
}

export { createMain };
