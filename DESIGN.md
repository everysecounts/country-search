# Design Decisions

## 1. Handling Outdated Requests

The application uses `AbortController` to cancel outdated network requests.

Whenever the search query changes, `createSearchController()` increments the `requestId`, clears the previous debounce timer, and calls `abortRequests()`.

The `abortRequests()` function iterates over all active controllers stored in `activeControllers` and calls `abort()` on each of them. This ensures that an active network request is actually cancelled immediately when the input changes, rather than waiting until the debounce period expires.

This is important because there is a delay between entering a new character and sending the next request. Without immediate cancellation, the previous request could finish during this delay and display outdated results for the new query.

Using only a request identifier or a boolean flag to ignore outdated responses would not be sufficient. Such an approach prevents outdated data from updating the UI, but the network request itself continues running, wasting network and server resources.

Therefore, the application combines two mechanisms:

- **`AbortController`** physically cancels outdated network requests.
- **`requestId`** provides an additional safeguard against outdated responses that may complete after a newer request has started.

Before updating the search state, `executeSearch()` checks whether the request identifier matches the current `requestId`. If they differ, the response is ignored.

Request cancellation and actual errors are handled separately. An `AbortError` is not displayed to the user because the request was cancelled by the application. A `TimeoutError`, however, is treated as an actual error because the request did not complete within the allowed time.

A timeout is implemented using `setTimeout` with a duration of 8000 ms. When the timeout expires, the controller calls `abort()` with a `DOMException` whose name is `TimeoutError`.

The `abortOnInput` option allows automatic cancellation on input changes to be disabled in a dedicated race-condition test. This makes it possible to resolve an earlier request after a later one and verify that an outdated response cannot overwrite the latest search state. In normal application usage, this option defaults to `true`.

The main implementation is located in `src/utils/searchController.ts`, while error classification is handled in `src/utils/searchError.ts`.

## 2. Debounce Delay

The application uses a debounce delay of 300 ms.

This prevents the application from sending a separate network request for every character while the user is typing. Whenever the input changes, the previous timer is cleared and a new one is started. The request is sent only after the user has stopped typing for 300 ms.

Without debounce, every keystroke would trigger a network request. For example, entering a country's name would generate multiple consecutive requests, increasing network traffic and the possibility of race conditions between responses.

A significantly longer delay, such as 1000–1500 ms, would make the interface feel less responsive because users would have to wait noticeably longer after finishing their input.

The selected 300 ms delay is a compromise between reducing unnecessary network requests and keeping the search responsive.

The delay is passed to `createSearchController()` as the `delay` parameter, which defaults to 300 ms. A separate reusable debounce utility is implemented in `src/utils/debounce.ts`.

## 3. Big O Complexity of mapCountryResponse

The `mapCountryResponse()` function transforms an API response object into a `CountryCard` object.

The main operation whose complexity depends on the input size is the transformation of the languages array:

```ts
languages: raw.languages.map(({ name }) => name);
```

Let `n` represent the number of languages in a country's API response.

**Time complexity: O(n).**

The `map()` method iterates over each language exactly once. All other fields (`name`, `flag`, `capital`, `region`, and `population`) are copied in constant time, O(1).

**Space complexity: O(n).**

A new languages array containing `n` strings is created. The remaining fields require constant additional space relative to the number of languages.

Caching and request deduplication are not implemented in the current version.

## 4. Clean Code Principles

The project follows several clean code principles.

### Separation of Responsibilities

Each module has a clearly defined responsibility:

- `src/api/searchCountries.ts` — performs HTTP requests and handles HTTP responses.
- `src/api/HttpError.ts` — defines a custom HTTP error class that stores the response status.
- `src/api/mapCountryResponse.ts` — transforms API data into the country card format.
- `src/utils/debounce.ts` — provides a reusable debounce function.
- `src/utils/searchController.ts` — manages search requests, timers, cancellation, and search states.
- `src/utils/searchError.ts` — classifies errors.
- `src/types/` — contains separate types for API data, country cards, search states, and errors.

This separation makes the code easier to maintain and allows individual modules to be tested independently.

### Pure Functions

`mapCountryResponse()` does not depend on the DOM, network requests, or external state. It receives an object and returns a new `CountryCard` object without modifying the original data.

This makes it possible to test data transformation using predefined examples without making actual API requests.

### Type Safety

Separate TypeScript types and interfaces are used for API responses, country cards, search states, and error types.

This makes module contracts explicit and helps detect errors during development.

### Centralized Error Handling

Error classification is implemented in `getSearchErrorType()` in `src/utils/searchError.ts`.

This keeps network errors, HTTP errors, timeouts, and request cancellation separate from the search state management logic.

### Resource Management

`createSearchController()` provides mechanisms for clearing debounce timers and cancelling active requests.

The `destroy()` method stops further controller activity and prevents state updates after the controller has been destroyed.
