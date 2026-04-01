// controllers/services.controller.js

import Services from "../models/Services.js";

//
// CREATE SERVICE
//
export const createService = async (req, res) => {
  try {
    const { serviceName, rate } = req.body;

    if (!serviceName || !rate) {
      return res.status(400).json({
        message: "Service name and rate are required",
      });
    }

    if (rate <= 0) {
      return res.status(400).json({
        message: "Rate must be greater than 0",
      });
    }

    const existing = await Services.findOne({ serviceName });

    if (existing) {
      return res.status(409).json({
        message: "Service already exists",
      });
    }

    const service = await Services.create({
      serviceName,
      rate,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//
// GET SERVICES (Pagination + Search)
//
export const getServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const filter = {};

    if (search) {
      filter.serviceName = { $regex: search, $options: "i" };
    }

    const total = await Services.countDocuments(filter);

    const services = await Services.find(filter)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limitNumber),
        currentPage: pageNumber,
        limit: limitNumber,
      },
      data: services,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//
// GET SINGLE
//
export const getServiceById = async (req, res) => {
  const service = await Services.findById(req.params.id);

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

//
// UPDATE
//
export const updateService = async (req, res) => {
  try {
    const { serviceName, rate } = req.body;

    if (rate && rate <= 0) {
      return res.status(400).json({
        message: "Rate must be greater than 0",
      });
    }

    const service = await Services.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    service.serviceName = serviceName || service.serviceName;
    service.rate = rate || service.rate;
    service.updatedBy = req.user.userId;

    await service.save();

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//
// DELETE
//
export const deleteService = async (req, res) => {
  const service = await Services.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      message: "Service not found",
    });
  }

  await service.deleteOne();

  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
  });
};
