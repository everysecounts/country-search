// \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
var header_module_default = {
	header: "_header_rif6k_1",
	headerTitle: "_headerTitle_rif6k_19",
	search: "_search_rif6k_37",
	searchSection: "_searchSection_rif6k_75",
	searchIcon: "_searchIcon_rif6k_85",
	searchInput: "_searchInput_rif6k_129",
	clearButton: "_clearButton_rif6k_173"
};
// src/utils/createElement.ts
function createElement(tagName, options = {}, children = []) {
	const element = document.createElement(tagName);
	const { className, textContent, attributes = {} } = options;
	if (className) element.className = className;
	if (textContent !== void 0) element.textContent = textContent;
	Object.entries(attributes).forEach(([name, value]) => {
		element.setAttribute(name, value);
	});
	children.forEach((child) => {
		element.append(child);
	});
	return element;
}
var search_history_module_default = {
	history: "_history_1uwyn_1",
	heading: "_heading_1uwyn_43",
	title: "_title_1uwyn_57",
	clearButton: "_clearButton_1uwyn_69",
	list: "_list_1uwyn_109",
	item: "_item_1uwyn_135",
	itemButton: "_itemButton_1uwyn_165",
	removeButton: "_removeButton_1uwyn_211"
};
// src/ui/components/SearchHistory/SearchHistory.ts
function createSearchHistory() {
	const title = createElement("h2", {
		className: search_history_module_default.title,
		textContent: "Recent searches"
	});
	const clearButton = createElement("button", {
		className: search_history_module_default.clearButton,
		textContent: "Clear all",
		attributes: {
			type: "button",
			"aria-label": "Clear all search history"
		}
	});
	const heading = createElement("div", { className: search_history_module_default.heading }, [title, clearButton]);
	const list = createElement("div", {
		className: search_history_module_default.list,
		attributes: {
			role: "group",
			"aria-label": "Recent searches"
		}
	});
	return {
		element: createElement("section", {
			className: search_history_module_default.history,
			attributes: {
				"aria-label": "Search history",
				hidden: ""
			}
		}, [heading, list]),
		list,
		clearButton
	};
}
function renderSearchHistory(container, list, queries, onSelect, onRemove) {
	if (queries.length === 0) {
		container.hidden = true;
		list.replaceChildren();
		return;
	}
	const items = queries.map((query) => {
		const selectButton = createElement("button", {
			className: search_history_module_default.itemButton,
			textContent: query,
			attributes: {
				type: "button",
				title: `Search for ${query}`
			}
		});
		const removeButton = createElement("button", {
			className: search_history_module_default.removeButton,
			textContent: "×",
			attributes: {
				type: "button",
				"aria-label": `Remove ${query} from search history`,
				title: `Remove ${query}`
			}
		});
		const item = createElement("div", { className: search_history_module_default.item }, [selectButton, removeButton]);
		selectButton.addEventListener("click", () => onSelect(query));
		removeButton.addEventListener("click", () => onRemove(query));
		return item;
	});
	list.replaceChildren(...items);
}
// src/ui/components/Header/Header.ts
function createHeader() {
	const title = createElement("h1", {
		className: header_module_default.headerTitle,
		textContent: "Country Search"
	});
	const input = createElement("input", {
		className: header_module_default.searchInput,
		attributes: {
			type: "search",
			placeholder: "Search countries...",
			"aria-label": "Search countries",
			autocomplete: "off"
		}
	});
	const clearButton = createElement("button", {
		className: header_module_default.clearButton,
		attributes: {
			type: "button",
			"aria-label": "Clear search",
			hidden: ""
		},
		textContent: "×"
	});
	clearButton.addEventListener("click", () => {
		input.value = "";
		input.dispatchEvent(new Event("input", { bubbles: true }));
		input.focus();
	});
	input.addEventListener("input", () => {
		clearButton.hidden = input.value.length === 0;
	});
	const search = createElement("div", { className: header_module_default.search }, [
		createElement("span", {
			className: header_module_default.searchIcon,
			attributes: { "aria-hidden": "true" }
		}),
		input,
		clearButton
	]);
	const { element: history, list: historyList, clearButton: historyClearButton } = createSearchHistory();
	const searchSection = createElement("div", { className: header_module_default.searchSection }, [search, history]);
	return {
		element: createElement("header", { className: header_module_default.header }, [title, searchSection]),
		searchSection,
		input,
		history,
		historyList,
		historyClearButton
	};
}
var country_details_module_default = {
	details: "_details_1988a_1",
	heading: "_heading_1988a_37",
	flag: "_flag_1988a_55",
	name: "_name_1988a_75",
	overview: "_overview_1988a_91",
	infoItem: "_infoItem_1988a_103",
	infoLabel: "_infoLabel_1988a_125",
	infoValue: "_infoValue_1988a_141",
	statistics: "_statistics_1988a_155",
	section: "_section_1988a_189",
	sectionTitle: "_sectionTitle_1988a_201",
	tags: "_tags_1988a_215",
	tag: "_tag_1988a_215",
	emptyValue: "_emptyValue_1988a_251"
};
// src/ui/components/CountryDetails/CountryDetails.ts
function createCountryDetails() {
	return createElement("aside", {
		className: country_details_module_default.details,
		attributes: {
			"aria-label": "Country details",
			hidden: ""
		}
	});
}
function createInfoItem(label, value) {
	const title = createElement("span", {
		className: country_details_module_default.infoLabel,
		textContent: label
	});
	const content = createElement("span", {
		className: country_details_module_default.infoValue,
		textContent: value
	});
	return createElement("div", { className: country_details_module_default.infoItem }, [title, content]);
}
function createTagList(label, values, emptyMessage) {
	const title = createElement("h3", {
		className: country_details_module_default.sectionTitle,
		textContent: label
	});
	const tags = values.length ? values.map((value) => createElement("span", {
		className: country_details_module_default.tag,
		textContent: value
	})) : [createElement("span", {
		className: country_details_module_default.emptyValue,
		textContent: emptyMessage
	})];
	const list = createElement("div", { className: country_details_module_default.tags }, tags);
	return createElement("section", { className: country_details_module_default.section }, [title, list]);
}
function renderCountryDetails(container, country) {
	const flag = createElement("img", {
		className: country_details_module_default.flag,
		attributes: {
			src: country.flag,
			alt: `${country.name} flag`,
			loading: "lazy"
		}
	});
	const name = createElement("h2", {
		className: country_details_module_default.name,
		textContent: country.name
	});
	const heading = createElement("div", { className: country_details_module_default.heading }, [flag, name]);
	const overview = createElement("section", { className: country_details_module_default.overview }, [
		createInfoItem("Capital", country.capital || "Unknown"),
		createInfoItem("Region", country.region || "Unknown"),
		createInfoItem("Subregion", country.subregion || "Unknown")
	]);
	const statistics = createElement("section", { className: country_details_module_default.statistics }, [createInfoItem("Population", country.population.toLocaleString("en-US")), createInfoItem("Area", country.area !== void 0 ? `${country.area.toLocaleString("en-US")} km²` : "Unknown")]);
	const currencySection = createTagList("Currencies", country.currencies.map(({ code, name: currencyName, symbol }) => `${currencyName} (${code}) ${symbol}`), "No currency information");
	const languageSection = createTagList("Languages", country.languages, "No language information");
	const borderSection = createTagList("Border countries", country.borders, "No land borders");
	container.replaceChildren(heading, overview, statistics, currencySection, languageSection, borderSection);
}
var country_card_module_default = {
	card: "_card_1l2tx_1",
	flag: "_flag_1l2tx_47",
	info: "_info_1l2tx_63",
	name: "_name_1l2tx_77",
	capital: "_capital_1l2tx_95",
	region: "_region_1l2tx_97",
	population: "_population_1l2tx_99"
};
// src/ui/components/CountryCard/CountryCard.ts
function createCountryCard(country, onSelect) {
	const flag = createElement("img", {
		className: country_card_module_default.flag,
		attributes: {
			src: country.flag,
			alt: `${country.name} flag`,
			loading: "lazy"
		}
	});
	const name = createElement("h2", {
		className: country_card_module_default.name,
		textContent: country.name
	});
	const capital = createElement("span", {
		className: country_card_module_default.capital,
		textContent: country.capital
	});
	const region = createElement("span", {
		className: country_card_module_default.region,
		textContent: country.region
	});
	const population = createElement("span", {
		className: country_card_module_default.population,
		textContent: country.population.toLocaleString("en-US")
	});
	const info = createElement("div", { className: country_card_module_default.info }, [name, capital]);
	const card = createElement("button", {
		className: country_card_module_default.card,
		attributes: {
			type: "button",
			"aria-label": `Show details for ${country.name}`
		}
	}, [
		flag,
		info,
		region,
		population
	]);
	card.addEventListener("click", () => {
		onSelect(country);
	});
	return card;
}
var search_results_module_default = {
	results: "_results_2cjiz_1",
	message: "_message_2cjiz_31",
	retry: "_retry_2cjiz_49",
	loading: "_loading_2cjiz_87",
	spinner: "_spinner_2cjiz_107",
	spin: "_spin_2cjiz_107"
};
// src/ui/components/SearchResults/SearchResults.ts
function createSearchResults() {
	return createElement("section", {
		className: search_results_module_default.results,
		attributes: {
			"aria-label": "Search results",
			"aria-live": "polite"
		}
	});
}
function renderCountries(container, countries, onSelect) {
	const cards = countries.map((country) => createCountryCard(country, onSelect));
	container.replaceChildren(...cards);
}
function renderMessage(container, message) {
	const element = createElement("p", {
		className: search_results_module_default.message,
		textContent: message
	});
	container.replaceChildren(element);
}
function renderError(container, message, onRetry) {
	const errorMessage = createElement("p", {
		className: search_results_module_default.message,
		textContent: message
	});
	const retryButton = createElement("button", {
		className: search_results_module_default.retry,
		textContent: "Retry",
		attributes: { type: "button" }
	});
	retryButton.addEventListener("click", onRetry);
	container.replaceChildren(errorMessage, retryButton);
}
function renderLoading(container) {
	const spinner = createElement("span", {
		className: search_results_module_default.spinner,
		attributes: {
			role: "status",
			"aria-label": "Loading"
		}
	});
	const message = createElement("p", {
		className: search_results_module_default.loadingMessage,
		textContent: "Searching countries..."
	});
	const loading = createElement("div", { className: search_results_module_default.loading }, [spinner, message]);
	container.replaceChildren(loading);
}
var main_module_default = { main: "_main_1vvd6_1" };
// src/ui/components/Main/Main.ts
function createMain() {
	const results = createSearchResults();
	const details = createCountryDetails();
	return {
		element: createElement("main", {
			className: main_module_default.main,
			attributes: { hidden: "" }
		}, [results, details]),
		results,
		details
	};
}
// src/utils/searchHistory.ts
var STORAGE_KEY = "country-search-history";
var MAX_HISTORY_ITEMS = 12;
function getSearchHistory() {
	try {
		const storedHistory = localStorage.getItem(STORAGE_KEY);
		if (!storedHistory) return [];
		const parsedHistory = JSON.parse(storedHistory);
		if (!Array.isArray(parsedHistory)) return [];
		return parsedHistory.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, MAX_HISTORY_ITEMS);
	} catch {
		return [];
	}
}
function addSearchHistory(query) {
	const normalizedQuery = query.trim();
	if (!normalizedQuery) return getSearchHistory();
	const updatedHistory = [normalizedQuery, ...getSearchHistory().filter((item) => item.toLowerCase() !== normalizedQuery.toLowerCase())].slice(0, MAX_HISTORY_ITEMS);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
	return updatedHistory;
}
function removeSearchHistory(query) {
	const updatedHistory = getSearchHistory().filter((item) => item.toLowerCase() !== query.toLowerCase());
	localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
	return updatedHistory;
}
function clearSearchHistory() {
	localStorage.removeItem(STORAGE_KEY);
}
// src/api/HttpError.ts
var HttpError = class extends Error {
	status;
	constructor(status) {
		super(`HTTP request failed with status ${status}`);
		this.name = "HttpError";
		this.status = status;
	}
};
// src/api/searchCountries.ts
async function searchCountries(query, signal) {
	const url = `https://countries.dev/name/${encodeURIComponent(query)}`;
	const response = await fetch(url, {
		method: "GET",
		signal
	});
	if (response.status === 404) return [];
	if (!response.ok) throw new HttpError(response.status);
	return await response.json();
}
// src/api/countrySearchService.ts
var CACHE_TTL = 3e5;
var MAX_CACHE_SIZE = 50;
var cache = /* @__PURE__ */ new Map();
var inFlight = /* @__PURE__ */ new Map();
function getCacheKey(query) {
	return query.trim().toLowerCase();
}
function getAbortReason(signal) {
	return signal.reason ?? new DOMException("The operation was aborted", "AbortError");
}
function getCachedResult(key) {
	const entry = cache.get(key);
	if (!entry) return;
	if (entry.expiresAt <= Date.now()) {
		cache.delete(key);
		return;
	}
	cache.delete(key);
	cache.set(key, entry);
	return entry.data;
}
function setCachedResult(key, data) {
	cache.delete(key);
	cache.set(key, {
		data,
		expiresAt: Date.now() + CACHE_TTL
	});
	if (cache.size > MAX_CACHE_SIZE) {
		const oldestKey = cache.keys().next().value;
		if (oldestKey !== void 0) cache.delete(oldestKey);
	}
}
function createInFlightRequest(key, query) {
	const controller = new AbortController();
	const request = {
		controller,
		promise: searchCountries(query, controller.signal),
		subscribers: /* @__PURE__ */ new Set()
	};
	inFlight.set(key, request);
	request.promise.then((data) => {
		if (inFlight.get(key) !== request) return;
		inFlight.delete(key);
		setCachedResult(key, data);
	}, () => {
		if (inFlight.get(key) === request) inFlight.delete(key);
	});
	return request;
}
function subscribeToRequest(key, request, signal) {
	return new Promise((resolve, reject) => {
		const subscriber = Symbol(key);
		let settled = false;
		request.subscribers.add(subscriber);
		function cleanup() {
			signal.removeEventListener("abort", handleAbort);
			request.subscribers.delete(subscriber);
		}
		function handleAbort() {
			if (settled) return;
			settled = true;
			cleanup();
			reject(getAbortReason(signal));
			if (request.subscribers.size === 0 && inFlight.get(key) === request) {
				inFlight.delete(key);
				request.controller.abort(signal.reason);
			}
		}
		signal.addEventListener("abort", handleAbort, { once: true });
		request.promise.then((data) => {
			if (settled) return;
			settled = true;
			cleanup();
			resolve(data);
		}, (error) => {
			if (settled) return;
			settled = true;
			cleanup();
			reject(error);
		});
		if (signal.aborted) handleAbort();
	});
}
function searchCountriesWithCache(query, signal) {
	const normalizedQuery = query.trim();
	if (signal.aborted) return Promise.reject(getAbortReason(signal));
	if (!normalizedQuery) return Promise.resolve([]);
	const key = getCacheKey(normalizedQuery);
	const cachedResult = getCachedResult(key);
	if (cachedResult !== void 0) return Promise.resolve(cachedResult);
	let request = inFlight.get(key);
	if (!request) request = createInFlightRequest(key, normalizedQuery);
	return subscribeToRequest(key, request, signal);
}
// src/api/mapCountryResponse.ts
function mapCountryResponse(raw) {
	return {
		name: raw.name,
		flag: raw.flags?.svg ?? raw.flag,
		capital: raw.capital,
		region: raw.region,
		population: raw.population,
		languages: raw.languages.map(({ name }) => name),
		subregion: raw.subregion,
		area: raw.area,
		currencies: raw.currencies ?? [],
		borders: raw.borders ?? []
	};
}
// src/utils/searchError.ts
function getSearchErrorType(error) {
	if (error instanceof HttpError) return "http";
	if (typeof error === "object" && error !== null && "name" in error) {
		if (error.name === "AbortError") return "abort";
		if (error.name === "TimeoutError") return "timeout";
	}
	return "network";
}
// src/utils/searchController.ts
var TIMEOUT_MS = 8e3;
function createSearchController(onStateChange, delay = 300, options = {}) {
	const { abortOnInput = true } = options;
	let lastQuery = "";
	let requestId = 0;
	let debounceTimer;
	let destroyed = false;
	const activeControllers = /* @__PURE__ */ new Set();
	function updateState(status, query, countries = [], errorType) {
		if (destroyed) return;
		onStateChange({
			status,
			query,
			countries,
			...errorType ? { errorType } : {}
		});
	}
	function clearDebounce() {
		if (debounceTimer === void 0) return;
		clearTimeout(debounceTimer);
		debounceTimer = void 0;
	}
	function abortRequests() {
		activeControllers.forEach((controller) => controller.abort());
		activeControllers.clear();
	}
	async function executeSearch(query, currentRequestId) {
		if (destroyed || currentRequestId !== requestId) return;
		const controller = new AbortController();
		activeControllers.add(controller);
		const timeoutId = setTimeout(() => {
			controller.abort(new DOMException("The operation timed out", "TimeoutError"));
		}, TIMEOUT_MS);
		try {
			const rawCountries = await searchCountriesWithCache(query, controller.signal);
			if (destroyed || currentRequestId !== requestId) return;
			const countries = rawCountries.map(mapCountryResponse);
			updateState(countries.length > 0 ? "success" : "empty", query, countries);
		} catch (error) {
			if (destroyed || currentRequestId !== requestId) return;
			const errorType = getSearchErrorType(error);
			if (errorType === "abort") return;
			updateState("error", query, [], errorType);
		} finally {
			clearTimeout(timeoutId);
			activeControllers.delete(controller);
		}
	}
	function onQueryChange(query) {
		if (destroyed) return;
		lastQuery = query;
		requestId += 1;
		const currentRequestId = requestId;
		clearDebounce();
		if (abortOnInput) abortRequests();
		if (!query.trim()) {
			updateState("idle", query);
			return;
		}
		updateState("loading", query);
		debounceTimer = setTimeout(() => {
			debounceTimer = void 0;
			executeSearch(query.trim(), currentRequestId);
		}, delay);
	}
	function retry() {
		if (destroyed || !lastQuery.trim()) return;
		requestId += 1;
		const currentRequestId = requestId;
		const query = lastQuery.trim();
		clearDebounce();
		abortRequests();
		updateState("loading", lastQuery);
		executeSearch(query, currentRequestId);
	}
	function destroy() {
		if (destroyed) return;
		destroyed = true;
		requestId += 1;
		clearDebounce();
		abortRequests();
	}
	return {
		onQueryChange,
		retry,
		destroy
	};
}
// src/ui/App.ts
function createApp(root) {
	const { element: header, searchSection, input, history, historyList, historyClearButton } = createHeader();
	const { element: main, results, details } = createMain();
	const controller = createSearchController(renderState);
	function updateHistory(queries) {
		renderSearchHistory(history, historyList, queries, selectHistoryQuery, removeHistoryItem);
	}
	function showHistory() {
		history.hidden = document.activeElement !== input || input.value.trim().length > 0 || historyList.childElementCount === 0;
	}
	function removeHistoryItem(query) {
		updateHistory(removeSearchHistory(query));
		showHistory();
		input.focus();
	}
	function clearHistory() {
		clearSearchHistory();
		updateHistory([]);
		history.hidden = true;
		input.focus();
	}
	function selectHistoryQuery(query) {
		input.value = query;
		history.hidden = true;
		input.dispatchEvent(new Event("input", { bubbles: true }));
		input.focus();
	}
	function selectCountry(country) {
		renderCountryDetails(details, country);
		details.hidden = false;
	}
	function renderState(state) {
		main.hidden = state.status === "idle";
		details.hidden = true;
		if (state.status === "idle") {
			results.replaceChildren();
			details.replaceChildren();
			return;
		}
		if (state.status === "loading") {
			renderLoading(results);
			return;
		}
		if (state.status === "success") {
			updateHistory(addSearchHistory(state.query));
			renderCountries(results, state.countries, selectCountry);
			return;
		}
		if (state.status === "empty") {
			updateHistory(addSearchHistory(state.query));
			renderMessage(results, "No countries found.");
			details.replaceChildren();
			return;
		}
		updateHistory(addSearchHistory(state.query));
		renderError(results, {
			timeout: "The request timed out. Please try again.",
			http: "The server returned an error. Please try again.",
			network: "Network error. Check your connection and try again.",
			abort: ""
		}[state.errorType ?? "network"], () => controller.retry());
		details.replaceChildren();
	}
	input.addEventListener("focus", showHistory);
	input.addEventListener("input", () => {
		controller.onQueryChange(input.value);
		showHistory();
	});
	input.addEventListener("blur", (event) => {
		const nextTarget = event.relatedTarget;
		if (nextTarget instanceof Node && history.contains(nextTarget)) return;
		history.hidden = true;
	});
	historyClearButton.addEventListener("click", clearHistory);
	document.addEventListener("pointerdown", (event) => {
		const target = event.target;
		if (target instanceof Node && !searchSection.contains(target)) history.hidden = true;
	});
	updateHistory(getSearchHistory());
	root.replaceChildren(header, main);
}
// src/main.ts
createApp(document.body);

//# sourceMappingURL=index-Bwl0IVb_.js.map