import styles from './country-details.module.css';
import { createElement } from '@/utils/createElement';

function createCountryDetails(): HTMLElement {
  return createElement('aside', {
    className: styles.details,
    attributes: {
      'aria-label': 'Country details',
      hidden: '',
    },
  });
}

export { createCountryDetails };
