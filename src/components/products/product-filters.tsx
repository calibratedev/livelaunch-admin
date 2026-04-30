'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
}

interface MultiSelectFilterProps {
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

export function MultiSelectFilter({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-9 justify-between gap-1 font-normal', className)}>
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <span>{placeholder} ({selected.length})</span>
          )}
          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const PRODUCT_STATUSES: FilterOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

interface ProductStatusFilterProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export function ProductStatusFilter({ selected, onChange }: ProductStatusFilterProps) {
  return (
    <MultiSelectFilter
      options={PRODUCT_STATUSES}
      selected={selected}
      onChange={onChange}
      placeholder="Status"
      searchPlaceholder="Search status..."
    />
  )
}

interface BrandFilterProps {
  brands: AppTypes.Brand[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function BrandFilter({ brands, selected, onChange }: BrandFilterProps) {
  const options = brands.map((brand) => ({
    value: brand.id,
    label: brand.name,
  }))

  return (
    <MultiSelectFilter
      options={options}
      selected={selected}
      onChange={onChange}
      placeholder="Brand"
      searchPlaceholder="Search brands..."
      emptyMessage="No brands found."
    />
  )
}
