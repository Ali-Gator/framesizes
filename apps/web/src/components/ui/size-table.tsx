import type { ReactNode } from "react";

export interface SizeTableRow {
  id: string;
  /** The first cell: the size as the visitor reads it. Also the radio's name. */
  label: string;
  cells: readonly ReactNode[];
  hidden?: boolean;
  /** The row has a mat: its cell in the `mat` column gets `data-mat` (CSS prefixes "With a mat"). */
  mat?: boolean;
}

/**
 * Design system SizeTable as a size chooser: each row's first cell is a `th scope="row"` with a
 * visually hidden radio and its label, all radios in one group (one tab stop, arrow keys select).
 * The label's hit area covers the row (widgets.css); `onClick` on the row backs it up where a
 * browser does not position inside a table row. Rows of another shape stay in the HTML, `hidden`.
 * Explicit roles keep the table semantics where the phone layout changes `display` (WebKit).
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
  columns: readonly { label: string; num?: boolean; mat?: boolean }[];
  rows: readonly SizeTableRow[];
  value: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="fs-table-wrap">
      <table className="fs-table" role="table">
        <caption className="fs-sr">{caption}</caption>
        <colgroup>
          {columns.map((column) => (
            <col key={column.label} className={column.num ? "fs-col-num" : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr role="row">
            {columns.map((column) => (
              <th key={column.label} scope="col" role="columnheader">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = `${name}-${row.id}`;
            return (
              <tr
                key={row.id}
                role="row"
                hidden={row.hidden}
                onClick={
                  onSelect &&
                  ((event) => {
                    // The label and the radio already select through onChange.
                    if (!(event.target as Element).closest("label, input")) onSelect(row.id);
                  })
                }
              >
                <th scope="row" role="rowheader" className={columns[0]?.num ? "fs-num" : undefined}>
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
                  <td
                    key={index}
                    role="cell"
                    className={columns[index + 1]?.num ? "fs-num" : undefined}
                    data-mat={row.mat && columns[index + 1]?.mat ? "" : undefined}
                  >
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
