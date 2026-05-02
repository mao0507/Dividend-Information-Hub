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
    root: ({ context }: any) => ({
      class: [
        'relative inline-flex w-9 h-5 rounded-full cursor-pointer transition-colors shrink-0',
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-accent',
        context.checked ? 'bg-accent' : 'bg-surface-3',
      ].join(' '),
    }),
    input: {
      class: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0 p-0',
    },
    slider: {
      class: 'absolute inset-0 rounded-full pointer-events-none',
    },
    handle: ({ context }: any) => ({
      class: [
        'absolute top-0.5 left-0 w-4 h-4 rounded-full shadow transition-transform duration-200',
        context.checked ? 'translate-x-[18px] bg-white' : 'translate-x-0.5 bg-content-faint',
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
  dialog: {
    root: {
      style: { borderRadius: '20px', overflow: 'hidden' },
    },
    mask: {
      style: {
        position: 'fixed', inset: '0', zIndex: '50',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      },
    },
    container: {
      style: {
        position: 'relative',
        background: '#101013',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      },
    },
    header: {
      style: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#101013',
        flexShrink: '0',
      },
    },
    title: {
      style: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '13px', fontWeight: '600',
        color: '#e8e8ea', letterSpacing: '0.025em',
      },
    },
    headerActions: {
      style: { display: 'flex', alignItems: 'center', marginLeft: '8px' },
    },
    closeButton: {
      style: {
        width: '24px', height: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '6px', cursor: 'pointer',
        color: 'rgba(255,255,255,0.38)',
        background: 'transparent', border: 'none',
        transition: 'color 0.15s, background 0.15s',
      },
    },
    closeIcon: {
      style: { width: '12px', height: '12px' },
    },
    content: {
      style: {
        padding: '16px 20px 20px',
        overflowY: 'auto',
        color: '#e8e8ea',
        background: '#101013',
      },
    },
  },
}
