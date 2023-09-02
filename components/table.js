import React from "react";

function TableComponent({ columns, data }) {
  return (
    <div className="table-scroll p-2">

      <table className="min-w-full">
        <thead>
          {columns.map((columnGroup, groupIndex) => (
            <tr key={`group-${groupIndex}`}>
              {columnGroup.map((column, columnIndex) => (
                <th
                  key={`col-${columnIndex}`}
                  colSpan={column.colSpan || 1}
                  rowSpan={column.rowSpan || 1}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {columns[columns.length - 1].map((column, columnIndex) => (
                <td key={`col-${columnIndex}`}>
                  {column.renderer ? column.renderer({ row: item, column }) : item[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableComponent;
