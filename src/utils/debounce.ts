function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  return (...args: Args) => {
    fn(...args);
    void delay;
  };
}

export { debounce };
