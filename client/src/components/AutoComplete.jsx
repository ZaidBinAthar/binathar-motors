import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function AutoComplete({
  options,
  value,
  onChange,
  placeholder,
  label,
  type = "text",
}) {
  const [search, setSearch] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filtered, setFiltered] = useState(options);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  useEffect(() => {
    setFiltered(options);
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setShowDropdown(true);
    const filteredOptions = options.filter((opt) =>
      opt.toLowerCase().includes(val.toLowerCase())
    );
    setFiltered(filteredOptions);
    if (filteredOptions.length === 1 && filteredOptions[0].toLowerCase() === val.toLowerCase()) {
      onChange(filteredOptions[0]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (option) => {
    setSearch(option);
    onChange(option);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const displayedOptions = search.length > 0 ? filtered : options.slice(0, 10);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={handleChange}
        onFocus={() => {
          setShowDropdown(true);
          setFiltered(search.length > 0 ? filtered : options.slice(0, 10));
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer pr-10"
        autoComplete="off"
      />
      <FaChevronDown className="absolute right-3 top-7 text-text-muted dark:text-dark-text-muted text-xs pointer-events-none" />
      {showDropdown && displayedOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {displayedOptions.map((opt, i) => (
            <div
              key={i}
              onClick={() => handleSelect(opt)}
              className="px-3 py-2 text-sm text-text dark:text-dark-text hover:bg-primary/10 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
      {showDropdown && displayedOptions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-lg p-3 text-sm text-text-muted">
          No options found
        </div>
      )}
    </div>
  );
}
