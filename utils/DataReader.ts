import fs from 'fs';
import { parse } from 'csv-parse/sync';
import XLSX from 'xlsx';

export class DataProvider {
  static readJson(filePath: string) {
    const contents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(contents);
  }

  static readCsv(filePath: string) {
    const contents = fs.readFileSync(filePath);
    return parse(contents, {
      columns: true,
      skip_empty_lines: true,
    });
  }

  static readExcel(filePath: string) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  }
}




