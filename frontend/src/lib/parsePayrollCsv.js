/**
 * Payroll CSV parser.
 * Supports comma or semicolon delimiters and accepts a few localized header variants.
 */
export function parsePayrollCsv(text) {
  const normalized = String(text).replace(/^\uFEFF/, "").trim();
  if (!normalized) {
    throw new Error("The CSV file is empty.");
  }

  const lines = normalized.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error("The CSV must contain at least one header row and one data row.");
  }

  const headerLine = lines[0];
  const semicolonCols = headerLine.split(";").length;
  const commaCols = headerLine.split(",").length;
  const delimiter = headerLine.includes(";") && semicolonCols >= commaCols ? ";" : ",";

  const headers = headerLine.split(delimiter).map((header) => header.trim().toLowerCase());

  const nameIdx = headers.findIndex((header) => header === "name" || header === "ad");
  const addressIdx = headers.findIndex(
    (header) =>
      header === "stellar_address" ||
      header === "address" ||
      header === "adres" ||
      header.includes("stellar") ||
      header.includes("address")
  );
  const amountIdx = headers.findIndex(
    (header) => header === "amount" || header === "miktar" || header.includes("amount")
  );

  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(delimiter).map((part) => part.trim());
    if (parts.every((part) => !part)) continue;

    let name;
    let address;
    let amount;

    if (nameIdx >= 0 && addressIdx >= 0 && amountIdx >= 0) {
      name = parts[nameIdx];
      address = parts[addressIdx];
      amount = parts[amountIdx];
    } else if (parts.length >= 3) {
      [name, address, amount] = parts;
    } else {
      throw new Error(`Row ${i + 1}: expected 3 columns using "${delimiter}", found ${parts.length}.`);
    }

    if (!name || !address || amount === undefined || amount === "") {
      throw new Error(
        `Row ${i + 1}: missing required fields (name, stellar_address, amount). Semicolon-separated CSV files are supported too.`
      );
    }

    rows.push({ name, address, amount });
  }

  if (rows.length === 0) {
    throw new Error("No valid employee rows were found in the CSV.");
  }

  return rows;
}
