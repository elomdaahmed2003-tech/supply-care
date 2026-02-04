import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableComboboxOption {
  value: string;
  label: string;
}

interface SearchableComboboxProps {
  options: SearchableComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = 'اختر أو ابحث...',
  allowCustom = false,
  customPlaceholder = 'أدخل قيمة مخصصة...',
  className,
  dir = 'ltr',
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if current value is custom (not in options)
  const isCustomValue = useMemo(() => {
    return value && !options.some(opt => opt.value === value);
  }, [value, options]);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter(
      opt => 
        opt.value.toLowerCase().includes(lowerSearch) || 
        opt.label.toLowerCase().includes(lowerSearch)
    );
  }, [options, search]);

  // Get display value
  const displayValue = useMemo(() => {
    if (!value) return '';
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
        setIsCustomMode(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearch('');
    setIsCustomMode(false);
  };

  const handleCustomSubmit = () => {
    if (search.trim()) {
      onChange(search.trim());
      setIsOpen(false);
      setSearch('');
      setIsCustomMode(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isCustomMode && search.trim()) {
        handleCustomSubmit();
      } else if (filteredOptions.length === 1) {
        handleSelect(filteredOptions[0].value);
      } else if (allowCustom && search.trim() && filteredOptions.length === 0) {
        handleCustomSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
      setIsCustomMode(false);
    }
  };

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-10 px-3 rounded-lg border border-input bg-background text-sm',
          'flex items-center justify-between gap-2',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'hover:bg-accent/50 transition-colors',
          isOpen && 'ring-2 ring-ring'
        )}
        dir={dir}
      >
        <span className={cn('truncate', !value && 'text-muted-foreground')}>
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span
              onClick={clearValue}
              className="p-1 rounded-full hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </span>
          )}
          <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isCustomMode ? customPlaceholder : 'ابحث...'}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              dir={dir}
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full px-3 py-2 text-sm text-right flex items-center justify-between',
                    'hover:bg-accent transition-colors',
                    value === option.value && 'bg-accent'
                  )}
                  dir={dir}
                >
                  <span>{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                لا توجد نتائج
              </div>
            )}

            {/* Custom Value Option */}
            {allowCustom && search.trim() && !options.some(opt => opt.value === search.trim()) && (
              <button
                type="button"
                onClick={handleCustomSubmit}
                className="w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-accent transition-colors border-t border-border bg-secondary/30"
                dir={dir}
              >
                <span className="text-primary font-medium">+</span>
                <span>استخدام "{search.trim()}"</span>
              </button>
            )}
          </div>

          {/* Custom Value Hint */}
          {allowCustom && !search && (
            <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-secondary/20 text-center">
              اكتب قيمة مخصصة أو اختر من القائمة
            </div>
          )}
        </div>
      )}

      {/* Custom Value Badge */}
      {isCustomValue && (
        <div className="absolute -top-2 -left-2 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
          مخصص
        </div>
      )}
    </div>
  );
}
