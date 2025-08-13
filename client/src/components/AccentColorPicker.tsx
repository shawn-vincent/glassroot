import { cn } from '@/lib/utils'
import { type AccentColor, accentColorLabels } from '@/lib/theme-colors'

interface AccentColorPickerProps {
  value: AccentColor
  onChange: (color: AccentColor) => void
  label?: string
  description?: string
}

// Configuration for each color's display in the picker
const accentColorConfig: Record<AccentColor, { bg: string; border: string }> = {
  // Grays
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-900/30',
    border: 'border-slate-500 dark:border-slate-400',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    border: 'border-gray-500 dark:border-gray-400',
  },
  zinc: {
    bg: 'bg-zinc-100 dark:bg-zinc-900/30',
    border: 'border-zinc-500 dark:border-zinc-400',
  },
  neutral: {
    bg: 'bg-neutral-100 dark:bg-neutral-900/30',
    border: 'border-neutral-500 dark:border-neutral-400',
  },
  stone: {
    bg: 'bg-stone-100 dark:bg-stone-900/30',
    border: 'border-stone-500 dark:border-stone-400',
  },
  // Reds
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-500 dark:border-red-400',
  },
  // Oranges
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-500 dark:border-orange-400',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-500 dark:border-amber-400',
  },
  // Yellows
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-500 dark:border-yellow-400',
  },
  lime: {
    bg: 'bg-lime-100 dark:bg-lime-900/30',
    border: 'border-lime-500 dark:border-lime-400',
  },
  // Greens
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-500 dark:border-green-400',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    border: 'border-emerald-500 dark:border-emerald-400',
  },
  // Cyans
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    border: 'border-teal-500 dark:border-teal-400',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    border: 'border-cyan-500 dark:border-cyan-400',
  },
  // Blues
  sky: {
    bg: 'bg-sky-100 dark:bg-sky-900/30',
    border: 'border-sky-500 dark:border-sky-400',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-500 dark:border-blue-400',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    border: 'border-indigo-500 dark:border-indigo-400',
  },
  // Purples
  violet: {
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    border: 'border-violet-500 dark:border-violet-400',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-500 dark:border-purple-400',
  },
  fuchsia: {
    bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
    border: 'border-fuchsia-500 dark:border-fuchsia-400',
  },
  // Pinks
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    border: 'border-pink-500 dark:border-pink-400',
  },
  rose: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    border: 'border-rose-500 dark:border-rose-400',
  },
}

// Define ring color classes for each accent
const ringColorClasses: Record<AccentColor, string> = {
  slate: "ring-slate-500 dark:ring-slate-400",
  gray: "ring-gray-500 dark:ring-gray-400",
  zinc: "ring-zinc-500 dark:ring-zinc-400",
  neutral: "ring-neutral-500 dark:ring-neutral-400",
  stone: "ring-stone-500 dark:ring-stone-400",
  red: "ring-red-500 dark:ring-red-400",
  orange: "ring-orange-500 dark:ring-orange-400",
  amber: "ring-amber-500 dark:ring-amber-400",
  yellow: "ring-yellow-500 dark:ring-yellow-400",
  lime: "ring-lime-500 dark:ring-lime-400",
  green: "ring-green-500 dark:ring-green-400",
  emerald: "ring-emerald-500 dark:ring-emerald-400",
  teal: "ring-teal-500 dark:ring-teal-400",
  cyan: "ring-cyan-500 dark:ring-cyan-400",
  sky: "ring-sky-500 dark:ring-sky-400",
  blue: "ring-blue-500 dark:ring-blue-400",
  indigo: "ring-indigo-500 dark:ring-indigo-400",
  violet: "ring-violet-500 dark:ring-violet-400",
  purple: "ring-purple-500 dark:ring-purple-400",
  fuchsia: "ring-fuchsia-500 dark:ring-fuchsia-400",
  pink: "ring-pink-500 dark:ring-pink-400",
  rose: "ring-rose-500 dark:ring-rose-400",
}

export function AccentColorPicker({ value, onChange, label, description }: AccentColorPickerProps) {
  const accentColors = Object.keys(accentColorConfig) as AccentColor[]
  
  // Group colors for better organization
  const colorGroups = [
    { label: 'Grays', colors: ['slate', 'gray', 'zinc', 'neutral', 'stone'] as AccentColor[] },
    { label: 'Warm', colors: ['red', 'orange', 'amber', 'yellow', 'lime'] as AccentColor[] },
    { label: 'Cool', colors: ['green', 'emerald', 'teal', 'cyan', 'sky'] as AccentColor[] },
    { label: 'Deep', colors: ['blue', 'indigo', 'violet', 'purple', 'fuchsia'] as AccentColor[] },
    { label: 'Pink', colors: ['pink', 'rose'] as AccentColor[] },
  ]
  
  return (
    <div className="space-y-2">
      {label && (
        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </div>
      )}
      
      <div className="space-y-3">
        {colorGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="text-xs text-muted-foreground">{group.label}</div>
            <div className="flex gap-2 flex-wrap">
              {group.colors.map((color) => {
                const config = accentColorConfig[color]
                const isSelected = value === color
                const colorLabel = accentColorLabels[color]
                
                return (
                  <button
                    type="button"
                    key={color}
                    onClick={() => onChange(color)}
                    className={cn(
                      "relative w-10 h-10 rounded-full border-2 transition-all",
                      "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                      config.bg,
                      config.border,
                      isSelected ? "ring-2 ring-offset-2" : "",
                      isSelected ? ringColorClasses[color] : ""
                    )}
                    style={{ '--tw-ring-offset-color': 'var(--bg)' } as React.CSSProperties}
                    title={colorLabel}
                    aria-label={`Select ${colorLabel} accent color`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={cn(
                          "w-4 h-4 rounded-full",
                          config.border.replace('border-', 'bg-')
                        )} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      {description && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
    </div>
  )
}

// Export all the color classes to ensure Tailwind includes them in the build
// This is necessary for Tailwind's purge process to know these classes are used
export const accentClasses = {
  // All background colors for light mode
  'bg-slate-100': 'bg-slate-100',
  'bg-gray-100': 'bg-gray-100',
  'bg-zinc-100': 'bg-zinc-100',
  'bg-neutral-100': 'bg-neutral-100',
  'bg-stone-100': 'bg-stone-100',
  'bg-red-100': 'bg-red-100',
  'bg-orange-100': 'bg-orange-100',
  'bg-amber-100': 'bg-amber-100',
  'bg-yellow-100': 'bg-yellow-100',
  'bg-lime-100': 'bg-lime-100',
  'bg-green-100': 'bg-green-100',
  'bg-emerald-100': 'bg-emerald-100',
  'bg-teal-100': 'bg-teal-100',
  'bg-cyan-100': 'bg-cyan-100',
  'bg-sky-100': 'bg-sky-100',
  'bg-blue-100': 'bg-blue-100',
  'bg-indigo-100': 'bg-indigo-100',
  'bg-violet-100': 'bg-violet-100',
  'bg-purple-100': 'bg-purple-100',
  'bg-fuchsia-100': 'bg-fuchsia-100',
  'bg-pink-100': 'bg-pink-100',
  'bg-rose-100': 'bg-rose-100',
  
  // All border colors
  'border-slate-500': 'border-slate-500',
  'border-gray-500': 'border-gray-500',
  'border-zinc-500': 'border-zinc-500',
  'border-neutral-500': 'border-neutral-500',
  'border-stone-500': 'border-stone-500',
  'border-red-500': 'border-red-500',
  'border-orange-500': 'border-orange-500',
  'border-amber-500': 'border-amber-500',
  'border-yellow-500': 'border-yellow-500',
  'border-lime-500': 'border-lime-500',
  'border-green-500': 'border-green-500',
  'border-emerald-500': 'border-emerald-500',
  'border-teal-500': 'border-teal-500',
  'border-cyan-500': 'border-cyan-500',
  'border-sky-500': 'border-sky-500',
  'border-blue-500': 'border-blue-500',
  'border-indigo-500': 'border-indigo-500',
  'border-violet-500': 'border-violet-500',
  'border-purple-500': 'border-purple-500',
  'border-fuchsia-500': 'border-fuchsia-500',
  'border-pink-500': 'border-pink-500',
  'border-rose-500': 'border-rose-500',
  
  // All ring colors
  'ring-slate-500': 'ring-slate-500',
  'ring-gray-500': 'ring-gray-500',
  'ring-zinc-500': 'ring-zinc-500',
  'ring-neutral-500': 'ring-neutral-500',
  'ring-stone-500': 'ring-stone-500',
  'ring-red-500': 'ring-red-500',
  'ring-orange-500': 'ring-orange-500',
  'ring-amber-500': 'ring-amber-500',
  'ring-yellow-500': 'ring-yellow-500',
  'ring-lime-500': 'ring-lime-500',
  'ring-green-500': 'ring-green-500',
  'ring-emerald-500': 'ring-emerald-500',
  'ring-teal-500': 'ring-teal-500',
  'ring-cyan-500': 'ring-cyan-500',
  'ring-sky-500': 'ring-sky-500',
  'ring-blue-500': 'ring-blue-500',
  'ring-indigo-500': 'ring-indigo-500',
  'ring-violet-500': 'ring-violet-500',
  'ring-purple-500': 'ring-purple-500',
  'ring-fuchsia-500': 'ring-fuchsia-500',
  'ring-pink-500': 'ring-pink-500',
  'ring-rose-500': 'ring-rose-500',
  
  // Solid backgrounds for center dots
  'bg-slate-500': 'bg-slate-500',
  'bg-gray-500': 'bg-gray-500',
  'bg-zinc-500': 'bg-zinc-500',
  'bg-neutral-500': 'bg-neutral-500',
  'bg-stone-500': 'bg-stone-500',
  'bg-red-500': 'bg-red-500',
  'bg-orange-500': 'bg-orange-500',
  'bg-amber-500': 'bg-amber-500',
  'bg-yellow-500': 'bg-yellow-500',
  'bg-lime-500': 'bg-lime-500',
  'bg-green-500': 'bg-green-500',
  'bg-emerald-500': 'bg-emerald-500',
  'bg-teal-500': 'bg-teal-500',
  'bg-cyan-500': 'bg-cyan-500',
  'bg-sky-500': 'bg-sky-500',
  'bg-blue-500': 'bg-blue-500',
  'bg-indigo-500': 'bg-indigo-500',
  'bg-violet-500': 'bg-violet-500',
  'bg-purple-500': 'bg-purple-500',
  'bg-fuchsia-500': 'bg-fuchsia-500',
  'bg-pink-500': 'bg-pink-500',
  'bg-rose-500': 'bg-rose-500',
}