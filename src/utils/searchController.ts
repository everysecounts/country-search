import type {
  SearchController,
  SearchControllerOptions,
  SearchState,
} from '@/types/searchController';

function createSearchController(
  onStateChange: (state: SearchState) => void,
  delay = 300,
  options: SearchControllerOptions = {},
): SearchController {
  void onStateChange;
  void delay;
  void options;

  return {
    onQueryChange(query: string): void {
      void query;
    },

    retry(): void {},

    destroy(): void {},
  };
}

export { createSearchController };
