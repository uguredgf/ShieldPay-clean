import { parsePayrollCsv } from "./parsePayrollCsv";

/**
 * Parse CSV text into employer rows.
 */
export function parseCSV(text) {
  try {
    const parsed = parsePayrollCsv(text);
    const rows = parsed.map((row, index) => {
      const amount = parseFloat(String(row.amount).replace(",", "."));
      if (Number.isNaN(amount)) {
        throw new Error(`Row ${index + 2}: invalid amount "${row.amount}"`);
      }
      return {
        name: row.name,
        address: row.address,
        amount,
        dept: row.department || row.dept || "—",
      };
    });
    return { rows, errors: [] };
  } catch (error) {
    return { rows: [], errors: [error.message] };
  }
}
