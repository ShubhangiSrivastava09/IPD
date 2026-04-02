// controllers/billing.controller.js

import Admission from "../models/Admission.js";
import AdmissionServices from "../models/AdmissionServices.js";
import { generateBillPDF } from "../utils/billpdfs.js";

export const getBill = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { discount = 0, tax = 0 } = req.query;

    // validate admission
    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({
        message: "Admission not found",
      });
    }

    const services = await AdmissionServices.find({ admissionId });

    if (!services.length) {
      return res.status(404).json({
        message: "No services found for this admission",
      });
    }

    // calculate total
    const serviceDetails = services.map((s) => ({
      serviceName: s.serviceName,
      rate: s.rate,
      qty: s.qty,
      total: s.rate * s.qty,
    }));

    const subTotal = serviceDetails.reduce((acc, s) => acc + s.total, 0);

    const taxAmount = (subTotal * Number(tax)) / 100;
    const discountAmount = (subTotal * Number(discount)) / 100;

    const finalAmount = subTotal + taxAmount - discountAmount;

    res.status(200).json({
      success: true,
      data: {
        admissionId,
        patientName: admission.patientName,
        services: serviceDetails,
        summary: {
          subTotal,
          taxPercent: Number(tax),
          taxAmount,
          discountPercent: Number(discount),
          discountAmount,
          finalAmount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const downloadBill = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { discount = 0, tax = 0 } = req.query;

    const admission = await Admission.findById(admissionId);
    const services = await AdmissionServices.find({ admissionId });

    if (!admission || !services.length) {
      return res
        .status(404)
        .json({ message: "Invalid admission or no services" });
    }

    // ← Add this to confirm controller is reached
    console.log("Generating PDF for:", admissionId);

    const serviceDetails = services.map((s) => ({
      serviceName: s.serviceName,
      rate: s.rate,
      qty: s.qty,
      total: s.rate * s.qty,
    }));

    const subTotal = serviceDetails.reduce((acc, s) => acc + s.total, 0);
    const taxAmount = (subTotal * Number(tax)) / 100;
    const discountAmount = (subTotal * Number(discount)) / 100;
    const finalAmount = subTotal + taxAmount - discountAmount;

    const billData = {
      admissionId,
      patientName: admission.patientName,
      services: serviceDetails,
      summary: { subTotal, taxAmount, discountAmount, finalAmount },
    };

    // ← Do NOT call res.json() anywhere before this
    generateBillPDF(billData, res);
  } catch (error) {
    console.error("PDF Error:", error);
    // ← Only send JSON error if headers not already sent
    if (!res.headersSent) {
      res.status(500).json({ message: "Server Error" });
    }
  }
};
