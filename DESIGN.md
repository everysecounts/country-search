# Design Decisions

## 1. Handling Outdated Requests

The application uses `AbortController` to cancel outdated network requests.

Whenever the search query changes, `createSearchController()` increments the `requestId`, clears the previous debounce timer, and calls `abortRequests()`.

The `abortRequests()` function iterates over all active controllers stored in `activeControllers` and calls `abort()` on each of them. This ensures that an active network request is actually cancelled immediately when the input changes, rather than waiting until the debounce period expires.

This is important because there is a delay between entering a new character and sending the next request. Without immediate cancellation, the previous request could finish during this delay and display outdated results under the new query.

Using only a request identifier or a boolean flag to ignore outdated responses would not be sufficient. Such an approach prevents outdated data from updating the UI, but the network request itself continues running, wasting network and server resources.

Therefore, the application combines two mechanisms:

- **`AbortController`** physically cancels outdated network requests.
- **`requestId`** provides an additional safeguard against outdated responses that may complete after a newer request has started.

Before updating the search state, `executeSearch()` checks whether the request identifier matches the current `requestId`. If they differ, the response is ignored.

Request cancellation and actual errors are handled separately. An `AbortError` is not displayed to the user because the request was cancelled by the application. A `TimeoutError`, however, is treated as an actual error because the request did not complete within the allowed time.

A timeout is implemented using `setTimeout` with a duration of 8000 ms. When the timeout expires, the controller calls `abort()` with a `DOMException` whose name is `TimeoutError`.

The `abortOnInput` option allows automatic cancellation on input changes to be disabled in a dedicated race-condition test. This makes it possible to resolve an earlier request after a later one and verify that an outdated response cannot overwrite the latest search state. In normal application usage, this option defaults to `true`.

The test suite covers these mechanisms separately:

- One test verifies that an active request is actually aborted and its Promise rejects with `AbortError`.
- Another test disables automatic cancellation to simulate responses arriving out of order and verifies that the `requestId` check prevents an outdated response from updating the search state.

The main implementation is located in `src/utils/searchController.ts`, while error classification is handled in `src/utils/searchError.ts`.

## 2. Debounce Delay

The application uses a debounce delay of 300 ms.

This prevents the application from sending a separate network request for every character while the user is typing. Whenever the input changes, the previous timer is cleared and a new one is started. The request is sent only after the user has stopped typing for 300 ms.

Without debounce, every keystroke would trigger a network request. For example, entering a country's name would generate multiple consecutive requests, increasing network traffic and the possibility of race conditions between responses.

A significantly longer delay, such as 1000–1500 ms, would make the interface feel less responsive because users would have to wait noticeably longer after finishing their input.

The selected 300 ms delay is a compromise between reducing unnecessary network requests and keeping the search responsive.

The delay is passed to `createSearchController()` as the `delay` parameter, which defaults to 300 ms. The controller manages its search timer using `setTimeout()` and `clearTimeout()`. A separate reusable debounce utility is implemented in `src/utils/debounce.ts` and tested independently.

## 3. Big O Complexity of mapCountryResponse

The `mapCountryResponse()` function transforms an API response object into a `CountryCard` object.

The main operation whose complexity depends on the input size is the transformation of the languages array:

```ts
languages: raw.languages.map(({ name }) => name);
```

Let `n` represent the number of languages in a country's API response.

**Time complexity: O(n).**

The `map()` method iterates over each language exactly once. All other fields (`name`, `flag`, `capital`, `region`, `population`, `subregion`, `area`, `currencies`, and `borders`) are copied or assigned in constant time, O(1).

**Space complexity: O(n).**

A new languages array containing `n` strings is created. The remaining fields require constant additional space relative to the number of languages.

The function does not modify the original API response.

## 4. Cache and Request Deduplication

The application implements in-memory caching and in-flight request deduplication in `src/api/countrySearchService.ts`.

Two `Map` instances are used:

- `cache` stores completed search results.
- `inFlight` stores requests that are currently executing.

### Cache

Cache keys are normalized using `trim()` and `toLowerCase()`. This allows equivalent queries, such as `France`, `france`, and `FRANCE`, to share the same cache entry.

Each cache entry has a time-to-live (TTL) of **5 minutes**. The expiration timestamp is stored with the cached data. Expired entries are removed when they are accessed.

The cache is limited to **50 entries** and uses the Least Recently Used (LRU) eviction strategy.

When a valid cache entry is accessed, it is removed from its current position in the `Map` and inserted again at the end. This marks it as recently used.

When the cache exceeds 50 entries, the first key in the `Map` is removed because it represents the least recently used entry.

### Request Deduplication

The `inFlight` Map prevents multiple network requests for the same normalized query from running simultaneously.

When a request for a query is already in progress, subsequent calls subscribe to the existing Promise instead of creating another network request.

Each subscriber has its own `AbortSignal`. The shared request has a separate `AbortController`, and subscribers are tracked using a `Set` of unique symbols.

Cancelling one subscriber does not abort the shared request while other subscribers are still waiting. The shared request is aborted only when the last subscriber cancels.

When a request succeeds, its result is stored in the cache and the in-flight entry is removed.

Failed requests are removed from the in-flight Map and are not cached. This allows subsequent attempts to retry the request.

An empty result returned for HTTP 404 is also a successful result at the service level and can be cached.

### Complexity

Let:

- `m` be the number of characters in the search query;
- `n` be the number of cached entries;
- `k` be the number of subscribers to a shared request.

The average time complexity is:

- Query normalization: O(m).
- Cache lookup: O(1).
- Cache insertion: O(1).
- LRU update: O(1).
- LRU eviction: O(1).
- In-flight request lookup and insertion: O(1).
- Subscriber registration and removal: O(1).
- Processing subscribers when a request settles: O(k).

The cache uses O(n) space for its entries, with a maximum of 50 entries. The total memory also depends on the size of the cached country data.

In-flight request storage depends on the number of concurrent queries and their subscribers.

## 5. Search History

The application stores recent successful, empty, and failed search queries in `localStorage`.

Search history is implemented in `src/utils/searchHistory.ts`.

The history:

- Stores up to 12 recent queries.
- Places the most recent query first.
- Removes duplicate queries using case-insensitive comparison.
- Trims whitespace from stored queries.
- Allows individual entries to be removed.
- Allows the entire history to be cleared.

The history is stored under the `country-search-history` key.

When a user selects a history entry, the application places the query into the search input and dispatches an input event. This reuses the normal search flow, including request cancellation, debounce, and cache lookup.

The history dropdown is rendered by `src/ui/components/SearchHistory/SearchHistory.ts` and coordinated by `src/ui/App.ts`.

## 6. Clean Code Principles

The project follows several clean code principles.

### Separation of Responsibilities

Each module has a clearly defined responsibility:

- `src/api/searchCountries.ts` — performs HTTP requests and handles HTTP responses.
- `src/api/HttpError.ts` — defines a custom HTTP error class that stores the response status.
- `src/api/mapCountryResponse.ts` — transforms API data into the country card format.
- `src/api/countrySearchService.ts` — manages cached search results, cache expiration, LRU eviction, and in-flight request deduplication.
- `src/utils/debounce.ts` — provides a reusable debounce function.
- `src/utils/searchController.ts` — manages search requests, timers, cancellation, timeouts, and search states.
- `src/utils/searchError.ts` — classifies errors.
- `src/utils/searchHistory.ts` — manages search history in `localStorage`.
- `src/ui/App.ts` — coordinates UI components, search state rendering, country selection, and search history interactions.
- `src/ui/components/` — contains separate UI components for the header, main layout, country cards, country details, search results, and search history.
- `src/types/` — contains separate types and interfaces for API data, country cards, search states, errors, and cache-related structures.

This separation makes the code easier to maintain and allows individual modules to be tested independently.

### Pure Functions

`mapCountryResponse()` does not depend on the DOM, network requests, or external state. It receives an object and returns a new `CountryCard` object without modifying the original data.

This makes it possible to test data transformation using predefined examples without making actual API requests.

### Type Safety

Separate TypeScript types and interfaces are used for API responses, country cards, search states, error types, cache entries, and in-flight requests.

This makes module contracts explicit and helps detect errors during development.

### Centralized Error Handling

Error classification is implemented in `getSearchErrorType()` in `src/utils/searchError.ts`.

This keeps network errors, HTTP errors, timeouts, and request cancellation separate from the search state management logic.

### Resource Management

`createSearchController()` provides mechanisms for clearing debounce timers and cancelling active requests.

The `destroy()` method stops further controller activity, clears pending timers, aborts active requests, and prevents state updates after the controller has been destroyed.

The cache also has a fixed maximum size and expiration time, preventing it from growing indefinitely.
