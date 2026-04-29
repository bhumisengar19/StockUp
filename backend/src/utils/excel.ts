import ExcelJS from 'exceljs';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';

export const generateExcelReport = async (res: Response, title: string, data: any[], columns: { header: string, key: string }[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  worksheet.columns = columns.map(c => ({ ...c, width: 20 }));
  
  worksheet.addRow(columns.map(c => c.header));
  
  // Format header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: 'center' };

  data.forEach(row => {
    worksheet.addRow(row);
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/\s+/g, '_')}.xlsx`);

  // Ensure export directory exists and save a copy
  const exportPath = path.join(process.cwd(), config.exports.excelPath);
  if (!fs.existsSync(exportPath)) {
    fs.mkdirSync(exportPath, { recursive: true });
  }
  const filePath = path.join(exportPath, `${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);

  await workbook.xlsx.write(res);
  res.end();
};
