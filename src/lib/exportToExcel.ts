import ExcelJS from "exceljs";

interface ExcelExportOptions {
  data: Record<string, string | number | boolean | null>[];
  fileName: string;
  sheetName?: string;
  headers?: string[];
}

export async function exportToExcel({
  data,
  fileName,
  sheetName = "Sheet1",
  headers,
}: ExcelExportOptions) {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  // If headers are not provided, use the keys from the first data object
  const columnHeaders = headers || Object.keys(data[0]);

  // Add headers
  worksheet.addRow(columnHeaders);

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  data.forEach((item) => {
    const row = columnHeaders.map((header) => item[header]);
    worksheet.addRow(row);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength + 2;
  });

  // Generate Excel file and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  link.click();

  // Clean up
  window.URL.revokeObjectURL(url);
}
