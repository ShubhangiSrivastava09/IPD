// controllers/admissionService.controller.js

import AdmissionService from "../models/AdmissionServices.js";
import Admission from "../models/Admission.js";
import ServiceMaster from "../models/Services.js";

export const addServicesToAdmission = async (req, res) => {
  try {
    const { admissionId, services } = req.body;

    if (!admissionId || !services?.length) {
      return res.status(400).json({
        message: "AdmissionId and services are required",
      });
    }

    // check admission
    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({
        message: "Admission not found",
      });
    }

    const preparedServices = [];

    for (const item of services) {
      const { serviceId, qty } = item;

      if (!serviceId || !qty || qty <= 0) {
        return res.status(400).json({
          message: "Invalid service data",
        });
      }

      const serviceMaster = await ServiceMaster.findById(serviceId);

      if (!serviceMaster) {
        return res.status(404).json({
          message: "Service not found in master",
        });
      }

      preparedServices.push({
        admissionId,
        serviceId,
        serviceName: serviceMaster.serviceName, // snapshot
        rate: serviceMaster.rate, // snapshot
        qty,
        createdBy: req.user.userId,
      });
    }

    // insert many
    const created = await AdmissionService.insertMany(preparedServices, {
      ordered: false,
    });

    res.status(201).json({
      success: true,
      message: "Services added successfully",
      data: created,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAdmissionServices = async (req, res) => {
  const { admissionId } = req.params;

  const services = await AdmissionService.find({ admissionId });

  res.status(200).json({
    success: true,
    data: services,
  });
};

export const updateAdmissionService = async (req, res) => {
  const { qty } = req.body;

  if (qty <= 0) {
    return res.status(400).json({
      message: "Quantity must be greater than 0",
    });
  }

  const service = await AdmissionService.findByIdAndUpdate(
    req.params.id,
    { qty },
    { new: true },
  );

  if (!service) {
    return res.status(404).json({
      message: "Service not found",
    });
  }

  res.status(200).json({
    success: true,
    data: service,
  });
};

export const deleteAdmissionService = async (req, res) => {
  const service = await AdmissionService.findByIdAndDelete(req.params.id);

  if (!service) {
    return res.status(404).json({
      message: "Service not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Service removed successfully",
  });
};
