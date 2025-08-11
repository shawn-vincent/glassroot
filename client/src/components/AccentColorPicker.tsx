import { cn } from '@/lib/utils'
import type { AccentColor } from './ChatMessage'

interface AccentColorPickerProps {
  value: AccentColor
  onChange: (color: AccentColor) => void
  label?: string
  description?: string
}

const accentColorConfig: Record<AccentColor, { bg: string; border: string; name: string }> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-500 dark:border-blue-400',
    name: 'Blue'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-500 dark:border-green-400',
    name: 'Green'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-500 dark:border-purple-400',
    name: 'Purple'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-500 dark:border-orange-400',
    name: 'Orange'
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    border: 'border-pink-500 dark:border-pink-400',
    name: 'Pink'
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    border: 'border-teal-500 dark:border-teal-400',
    name: 'Teal'
  },
  neutral: {
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    border: 'border-gray-500 dark:border-gray-400',
    name: 'Neutral'
  }
}

export function AccentColorPicker({ value, onChange, label, description }: AccentColorPickerProps) {
  const accentColors = Object.keys(accentColorConfig) as AccentColor[]
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <div className="flex gap-2 flex-wrap">
        {accentColors.map((color) => {
          const config = accentColorConfig[color]
          const isSelected = value === color
          
          return (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={cn(
                "relative w-10 h-10 rounded-full border-2 transition-all",
                "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                config.bg,
                config.border,
                isSelected ? "ring-2 ring-offset-2" : "",
                isSelected && color === 'blue' ? "ring-blue-500 dark:ring-blue-400" : "",
                isSelected && color === 'green' ? "ring-green-500 dark:ring-green-400" : "",
                isSelected && color === 'purple' ? "ring-purple-500 dark:ring-purple-400" : "",
                isSelected && color === 'orange' ? "ring-orange-500 dark:ring-orange-400" : "",
                isSelected && color === 'pink' ? "ring-pink-500 dark:ring-pink-400" : "",
                isSelected && color === 'teal' ? "ring-teal-500 dark:ring-teal-400" : "",
                isSelected && color === 'neutral' ? "ring-gray-500 dark:ring-gray-400" : ""
              )}
              style={{ ['--tw-ring-offset-color' as keyof React.CSSProperties]: 'var(--bg)' } as React.CSSProperties}
              title={config.name}
              aria-label={`Select ${config.name} accent color`}
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
      {description && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
    </div>
  )
}

// Export the color classes to ensure Tailwind includes them
export const accentClasses = {
  // Background colors - light
  'bg-blue-100': 'bg-blue-100',
  'bg-green-100': 'bg-green-100',
  'bg-purple-100': 'bg-purple-100',
  'bg-orange-100': 'bg-orange-100',
  'bg-pink-100': 'bg-pink-100',
  'bg-teal-100': 'bg-teal-100',
  'bg-gray-100': 'bg-gray-100',
  // Background colors - dark
  'dark:bg-blue-900/30': 'dark:bg-blue-900/30',
  'dark:bg-green-900/30': 'dark:bg-green-900/30',
  'dark:bg-purple-900/30': 'dark:bg-purple-900/30',
  'dark:bg-orange-900/30': 'dark:bg-orange-900/30',
  'dark:bg-pink-900/30': 'dark:bg-pink-900/30',
  'dark:bg-teal-900/30': 'dark:bg-teal-900/30',
  'dark:bg-gray-900/30': 'dark:bg-gray-900/30',
  // Border colors - light
  'border-blue-500': 'border-blue-500',
  'border-green-500': 'border-green-500',
  'border-purple-500': 'border-purple-500',
  'border-orange-500': 'border-orange-500',
  'border-pink-500': 'border-pink-500',
  'border-teal-500': 'border-teal-500',
  'border-gray-500': 'border-gray-500',
  // Border colors - dark
  'dark:border-blue-400': 'dark:border-blue-400',
  'dark:border-green-400': 'dark:border-green-400',
  'dark:border-purple-400': 'dark:border-purple-400',
  'dark:border-orange-400': 'dark:border-orange-400',
  'dark:border-pink-400': 'dark:border-pink-400',
  'dark:border-teal-400': 'dark:border-teal-400',
  'dark:border-gray-400': 'dark:border-gray-400',
  // Ring colors
  'ring-blue-500': 'ring-blue-500',
  'ring-green-500': 'ring-green-500',
  'ring-purple-500': 'ring-purple-500',
  'ring-orange-500': 'ring-orange-500',
  'ring-pink-500': 'ring-pink-500',
  'ring-teal-500': 'ring-teal-500',
  'ring-gray-500': 'ring-gray-500',
  'dark:ring-blue-400': 'dark:ring-blue-400',
  'dark:ring-green-400': 'dark:ring-green-400',
  'dark:ring-purple-400': 'dark:ring-purple-400',
  'dark:ring-orange-400': 'dark:ring-orange-400',
  'dark:ring-pink-400': 'dark:ring-pink-400',
  'dark:ring-teal-400': 'dark:ring-teal-400',
  'dark:ring-gray-400': 'dark:ring-gray-400',
  // Solid backgrounds
  'bg-blue-500': 'bg-blue-500',
  'bg-green-500': 'bg-green-500',
  'bg-purple-500': 'bg-purple-500',
  'bg-orange-500': 'bg-orange-500',
  'bg-pink-500': 'bg-pink-500',
  'bg-teal-500': 'bg-teal-500',
  'bg-gray-500': 'bg-gray-500',
}