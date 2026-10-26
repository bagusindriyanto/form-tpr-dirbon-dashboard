import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Combobox as ComboboxPrimitive } from '@base-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  type ComponentProps,
  type RefObject,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const ITEM_ESTIMATE_HEIGHT = 28;
const OVERSCAN = 10;
const LIST_PADDING = 4;

type Virtualizer = ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>;

type ComboboxProps = Omit<
  ComponentProps<typeof ComboboxInput>,
  'value' | 'defaultValue' | 'onChange'
> & {
  items: readonly string[];
  value: string;
  isPending?: boolean;
  isError?: boolean;
  onValueChange: (name: string) => void;
};

export default function FormCombobox({
  items,
  value,
  isPending = false,
  isError = false,
  onValueChange,
  ...inputProps
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const virtualizerRef = useRef<Virtualizer | null>(null);

  return (
    <Combobox
      items={items}
      value={value || null}
      onValueChange={(nextValue) => onValueChange(nextValue ?? '')}
      virtualized
      open={open}
      onOpenChange={setOpen}
      onItemHighlighted={(_item, { index, reason }) => {
        if (reason === 'pointer' || index < 0) {
          return;
        }

        queueMicrotask(() => {
          virtualizerRef.current?.scrollToIndex(index, { align: 'auto' });
        });
      }}
    >
      <ComboboxInput {...inputProps} showClear />
      <ComboboxContent>
        <ComboboxEmpty>
          {isPending ? (
            <span className="shimmer">Memuat...</span>
          ) : isError ? (
            'Gagal memuat data.'
          ) : (
            'Data tidak ditemukan.'
          )}
        </ComboboxEmpty>

        <VirtualizedList open={open} virtualizerRef={virtualizerRef} />
      </ComboboxContent>
    </Combobox>
  );
}

function VirtualizedList({
  open,
  virtualizerRef,
}: {
  open: boolean;
  virtualizerRef: RefObject<Virtualizer | null>;
}) {
  const filteredItems = ComboboxPrimitive.useFilteredItems<string>();
  const scrollElementRef = useRef<HTMLDivElement | null>(null);

  // TanStack Virtual returns mutable functions, so React Compiler intentionally
  // skips this component. Memoize the callbacks that need stable identities.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    enabled: open,
    count: filteredItems.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => ITEM_ESTIMATE_HEIGHT,
    overscan: OVERSCAN,
    paddingStart: LIST_PADDING,
    paddingEnd: LIST_PADDING,
    scrollPaddingStart: LIST_PADDING,
    scrollPaddingEnd: LIST_PADDING,
  });

  useImperativeHandle(virtualizerRef, () => virtualizer, [virtualizer]);

  const handleScrollElementRef = useCallback(
    (element: HTMLDivElement | null) => {
      scrollElementRef.current = element;

      if (element) {
        virtualizer.measure();
      }
    },
    [virtualizer],
  );

  // Base UI resets non-virtualized lists to the top when the query changes.
  // Virtualized lists own their scroller, so reset it manually when results change.
  useLayoutEffect(() => {
    scrollElementRef.current?.scrollTo({ top: 0 });
  }, [filteredItems]);

  const totalSize = virtualizer.getTotalSize();

  return (
    <ComboboxList
      ref={handleScrollElementRef}
      className="scroll-fade-y px-1 py-0"
    >
      {filteredItems.length > 0 && (
        <div
          role="presentation"
          className="relative w-full"
          style={{ height: totalSize }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = filteredItems[virtualItem.index];

            if (!item) {
              return null;
            }

            return (
              <ComboboxItem
                key={virtualItem.key}
                index={virtualItem.index}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                value={item}
                aria-setsize={filteredItems.length}
                aria-posinset={virtualItem.index + 1}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {item}
              </ComboboxItem>
            );
          })}
        </div>
      )}
    </ComboboxList>
  );
}
