import { createCountryDetails } from '@/ui/components/CountryDetails';
import { createSearchResults } from '@/ui/components/SearchResults';
import { createElement } from '@/utils/createElement';

function createMain(): HTMLElement {
  const results = createSearchResults();
  const details = createCountryDetails();

  return createElement(
    'main',
    {
      className: 'main',
      attributes: {
        hidden: '',
      },
    },
    [results, details],
  );
}

export { createMain };
