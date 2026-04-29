/** PrimeVue 4 全域 Pass-through 設定（unstyled 模式）。 */
export const primevuePT = {
  button: {
    root: ({ props }: any) => ({
      class: [
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-opacity cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        props.size === 'small' && 'text-xs px-3 py-1.5',
        !props.size && 'text-sm px-4 py-2',
        props.size === 'large' && 'text-sm px-5 py-3',
        !props.severity && !props.text && 'bg-accent text-surface font-semibold hover:opacity-90',
        props.severity === 'secondary' && !props.text && 'bg-surface-2 border border-border-strong text-content-soft hover:text-content',
        props.text && 'text-content-soft hover:text-content hover:bg-surface-2',
      ].filter(Boolean),
    }),
    loadingIcon: { class: 'w-3 h-3 animate-spin' },
  },
  select: {
    root: {
      class: 'w-full relative inline-flex items-center bg-surface border border-border rounded-[8px] cursor-pointer transition-colors outline-none hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent',
    },
    label: {
      class: 'flex-1 px-2.5 py-2 text-[12px] text-content font-mono truncate',
    },
    dropdown: {
      class: 'flex items-center justify-center pr-2 text-content-faint',
    },
    overlay: {
      class: 'bg-surface border border-border rounded-[8px] py-1 shadow-lg z-50 overflow-auto max-h-48',
    },
    listContainer: {
      class: 'max-h-48 overflow-auto',
    },
    list: { class: 'p-0 m-0 list-none' },
    option: ({ context }: any) => ({
      class: [
        'px-2.5 py-1.5 text-[12px] font-mono text-content cursor-pointer transition-colors hover:bg-surface-2',
        context.focused ? 'bg-surface-2' : '',
        context.selected ? 'text-accent' : '',
      ].join(' '),
    }),
  },
  toggleswitch: {
    root: ({ props }: any) => ({
      class: [
        'relative inline-flex w-8 h-[18px] rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        props.modelValue ? 'bg-accent' : 'bg-surface-3',
      ].join(' '),
    }),
    slider: ({ props }: any) => ({
      class: [
        'absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all',
        props.modelValue ? 'left-[18px] bg-surface' : 'left-[2px] bg-content-soft',
      ].join(' '),
    }),
  },
  chip: {
    root: {
      class: 'inline-flex items-center gap-1 font-mono text-[10px] font-medium tracking-wide rounded-[4px] px-[7px] py-[2px]',
    },
  },
  slider: {
    root: { class: 'relative h-1 bg-surface-3 rounded-full' },
    range: { class: 'absolute left-0 top-0 h-full bg-accent rounded-full' },
    handle: {
      class: 'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-content rounded-full shadow ring-2 ring-surface cursor-pointer focus:outline-none',
    },
  },
  badge: {
    root: {
      class: 'inline-flex items-center justify-center font-mono text-[10px] font-semibold px-[5px] py-[1px] rounded-[3px] bg-accent/15 text-accent leading-none',
    },
  },
}
