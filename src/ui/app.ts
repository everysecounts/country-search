import { createHeader } from '@/ui/components/Header';
import { createMain } from '@/ui/components/Main';

function createApp(root: HTMLElement): void {
  const { element: header } = createHeader();
  const main = createMain();

  root.replaceChildren(header, main);
}

export { createApp };
