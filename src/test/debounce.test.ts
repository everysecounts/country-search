import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '@/utils/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not call the function immediately', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced();

    expect(callback).not.toHaveBeenCalled();
  });

  it('should call the function after the specified delay', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced();

    vi.advanceTimersByTime(299);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer when called again before the delay expires', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced();

    vi.advanceTimersByTime(200);

    debounced();

    vi.advanceTimersByTime(200);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
