import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Button } from './button';
import { Input } from './input';

export default function FilterBar({
  search,
  onSearchChange,
  filters = [],
  onFilterChange,
  activeFilters = {},
}) {
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const handleClearFilters = () => {
    // Call onFilterChange for each filter key with undefined to clear it
    filters.forEach(filter => {
      onFilterChange(filter.key, undefined);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
        <Input
          type="text"
          placeholder="Search..."
          value={search || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-bg-accent border-border-primary text-text-primary placeholder:text-text-tertiary focus-visible:ring-accent-blue"
        />
      </div>

      {/* Select Filters */}
      {filters.map((filter) => (
        <div key={filter.key} className="w-full sm:w-48">
          <Select
            value={activeFilters[filter.key] || "all"}
            onValueChange={(val) => onFilterChange(filter.key, val === 'all' ? undefined : val)}
          >
            <SelectTrigger className="w-full bg-bg-secondary border-border-primary text-text-primary focus:ring-accent-blue">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent className="bg-bg-secondary border-border-primary text-text-primary">
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={handleClearFilters}
          className="text-text-secondary hover:text-text-primary hover:bg-bg-tertiary px-3"
        >
          <X size={16} className="mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}
