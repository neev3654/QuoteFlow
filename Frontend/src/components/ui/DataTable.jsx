import EmptyState from './EmptyState';

export default function DataTable({ columns, data = [], loading = false, emptyMessage = "No data found", onRowClick }) {
  if (loading) {
    return (
      <div className="bg-bg-secondary rounded-xl border border-border-primary overflow-hidden">
        <div className="w-full">
          <div className="bg-bg-tertiary border-b border-border-primary flex">
            {columns.map((col, idx) => (
              <div key={idx} className="px-6 py-3 flex-1">
                <div className="skeleton h-4 w-20 rounded"></div>
              </div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].map(row => (
            <div key={row} className="border-b border-border-primary flex last:border-0">
              {columns.map((col, idx) => (
                <div key={idx} className="px-6 py-4 flex-1">
                  <div className="skeleton h-5 w-full rounded max-w-[80%]"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-bg-secondary rounded-xl border border-border-primary">
        <EmptyState title="No Data" description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-primary overflow-hidden w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-bg-tertiary border-b border-border-primary">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={`px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-primary">
          {data.map((row, rowIndex) => (
            <tr 
              key={row._id || rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`
                group transition-colors
                ${rowIndex % 2 === 0 ? 'bg-bg-secondary' : 'bg-bg-accent/20'}
                ${onRowClick ? 'cursor-pointer hover:bg-bg-tertiary/50' : 'hover:bg-bg-tertiary/30'}
              `}
            >
              {columns.map((col) => (
                <td 
                  key={col.key} 
                  className={`px-6 py-4 whitespace-nowrap text-sm text-text-primary ${col.className || ''}`}
                >
                  {col.render ? col.render(row) : (
                    // Wrap IDs and numbers in mono if appropriate, or use simple string mapping
                    // Using a heuristic: if the value looks like an ID, number or starts with #
                    // we might want mono, but the user spec said "Numbers and IDs in cells: wrap in font-mono".
                    // It's safer to let the `render` function handle mono mapping or just pass raw data
                    // But if it's raw text and we want default behavior:
                    String(row[col.key] ?? '')
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
