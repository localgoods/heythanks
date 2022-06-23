/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare type TipVariant = {
  id: string
  price: number
}

declare type TipSettings = {
  // Emoji Options
  firstEmoji: string;
  secondEmoji: string;

  // Style Options
  backgroundColor: string;
  selectionColor: string;
  strokeColor: string;
  strokeWidth: number;
  cornerRadius: number;

  // Text Options
  labelText: string;
  tooltipText: string;

  // Price Options
  firstPrice: number;
  secondPrice: number;

  show: boolean;
}

declare type Tip = {
  option: string | undefined;
  setOption: (option?: string) => void
}


declare type CartSection = {
  id: string;
  section: string;
  selector: string;
}