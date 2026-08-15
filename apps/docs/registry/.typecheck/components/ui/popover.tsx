import type { ReactNode } from 'react';
export declare function Popover(props: {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  children?: ReactNode;
}): JSX.Element;
export declare function PopoverTrigger(props: {
  asChild?: boolean;
  children?: ReactNode;
}): JSX.Element;
export declare function PopoverContent(props: {
  className?: string;
  align?: string;
  dir?: string;
  children?: ReactNode;
}): JSX.Element;
