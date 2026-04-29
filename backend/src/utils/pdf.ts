import PDFDocument from 'pdfkit';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';

export const generatePDFReport = (res: Response, title: string, data: any[], columns: string[]) => {
  const doc = new PDFDocument({ margin: 30 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/\s+/g, '_')}.pdf`);

  doc.pipe(res);

  // Ensure export directory exists and save a copy
  const exportPath = path.join(process.cwd(), config.exports.pdfPath);
  if (!fs.existsSync(exportPath)) {
    fs.mkdirSync(exportPath, { recursive: true });
  }
  const filePath = path.join(exportPath, `${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Title
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown(2);

  // Simple table generation
  let y = doc.y;
  const colWidth = 500 / columns.length;

  // Header
  doc.fontSize(12).font('Helvetica-Bold');
  columns.forEach((col, i) => {
    doc.text(col, 30 + i * colWidth, y);
  });
  doc.moveDown();
  y = doc.y;

  doc.lineWidth(1).moveTo(30, y).lineTo(530, y).stroke();
  y += 10;

  // Rows
  doc.font('Helvetica');
  data.forEach((row) => {
    let maxHeight = 0;
    columns.forEach((col, i) => {
      const text = String(row[col.toLowerCase()] || '');
      doc.text(text, 30 + i * colWidth, y, { width: colWidth - 10 });
      const h = doc.heightOfString(text, { width: colWidth - 10 });
      if (h > maxHeight) maxHeight = h;
    });
    y += maxHeight + 10;
    
    // Add new page if necessary
    if (y > 700) {
      doc.addPage();
      y = 30;
    }
  });

  doc.end();
};
