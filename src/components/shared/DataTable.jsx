import { useTheme } from '../../context/ThemeContext';

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '48px', textAlign: 'center', color: theme.steel, fontSize: '14px' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: theme.smoke }}>
            {columns.map((col, idx) => (
              <th key={idx} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${theme.fog}`, whiteSpace: 'nowrap' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick?.(row)}
              style={{ borderBottom: rowIdx < data.length - 1 ? `1px solid ${theme.fog}` : 'none', cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.15s' }}
              onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.background = theme.smoke; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} style={{ padding: '14px 16px', fontSize: '14px', color: theme.nero, fontFamily: col.mono ? '"IBM Plex Mono", monospace' : 'inherit' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
