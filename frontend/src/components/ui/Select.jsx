export default function Select({
  label,
  error,
  options = [],
  className = "",
  id,
  ...props
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100 transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          ${error
            ? "border-red-400 dark:border-red-500"
            : "border-gray-300 dark:border-gray-600"
          }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
