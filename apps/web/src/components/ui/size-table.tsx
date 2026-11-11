import type { ReactNode } from "react";

export interface SizeTableRow {
  id: string;
  /** The first cell: the size as the visitor reads it. Also the radio's name. */
  label: string;
  cells: readonly ReactNode[];
  hidden?: boolean;
}

/**
 * Design system SizeTable as a size chooser: each row's first cell is a `th scope="row"` with a
 * visually hidden radio and its label, all radios in one group (one tab stop, arrow keys select).
 * The label's hit area covers the row (widgets.css); `onClick` on the row backs it up where a
 * browser does not position inside a table row. Rows of another shape stay in the HTML, `hidden`.
 */
export function SizeTable({
  caption,
  name,
  columns,
  rows,
  value,
  onSelect,
}: {
  caption: string;
  name: string;
  columns: readonly { label: string; num?: boolean }[];
  rows: readonly SizeTableRow[];
  value: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="fs-table-wrap">
      <table className="fs-table">
        <caption className="fs-sr">{caption}</caption>
        <colgroup>
          {columns.map((column) => (
            <col key={column.label} className={column.num ? "fs-col-num" : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = `${name}-${row.id}`;
            return (
              <tr key={row.id} hidden={row.hidden} onClick={onSelect && (() => onSelect(row.id))}>
                <th scope="row" className={columns[0]?.num ? "fs-num" : undefined}>
                  <input
                    type="radio"
                    className="fs-sr"
                    name={name}
                    id={id}
                    value={row.id}
                    checked={row.id === value}
                    onChange={() => onSelect?.(row.id)}
                    readOnly={!onSelect}
                  />
                  <label htmlFor={id}>{row.label}</label>
                </th>
                {row.cells.map((cell, index) => (
                  <td key={index} className={columns[index + 1]?.num ? "fs-num" : undefined}>
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
