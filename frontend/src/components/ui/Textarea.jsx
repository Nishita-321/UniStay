export default function Textarea({
  label,
  error,
  className = "",
  id,
  rows = 3,
  ...props
}) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none
          ${error ? "border-red-400" : "border-gray-300 dark:border-gray-600"}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
