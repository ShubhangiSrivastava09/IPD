// utils/billPdf.js

import PDFDocument from "pdfkit";

export const generateBillPDF = (billData, res) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=bill.pdf");

  doc.pipe(res);

  doc.fontSize(18).text("Hospital Bill", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Patient: ${billData.patientName}`);
  doc.text(`Admission ID: ${billData.admissionId}`);
  doc.moveDown();

  doc.text("Services:");
  doc.moveDown();

  billData.services.forEach((s) => {
    doc.text(`${s.serviceName} | ${s.rate} x ${s.qty} = ${s.total}`);
  });

  doc.moveDown();

  doc.text(`Subtotal: ${billData.summary.subTotal}`);
  doc.text(`Tax: ${billData.summary.taxAmount}`);
  doc.text(`Discount: ${billData.summary.discountAmount}`);
  doc.text(`Final Amount: ${billData.summary.finalAmount}`);

  doc.end();
};
