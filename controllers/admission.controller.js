import Admission from "../models/Admission.js";

export const createAdmission = async (req, res) => {
  try {
    const { patientName, age, gender, admissionDate } = req.body;

    if (!patientName || !age || !gender || !admissionDate) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    console.log("user", req.user);

    const admission = await Admission.create({
      patientName,
      age,
      gender,
      admissionDate,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Admission created successfully",
      data: admission,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAdmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      gender,
      fromDate,
      toDate,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const filter = {};

    // 🔍 Search (by patient name)
    if (search) {
      filter.patientName = { $regex: search, $options: "i" };
    }

    // 🎯 Filter by gender
    if (gender) {
      filter.gender = gender;
    }

    // 📅 Date range filter
    if (fromDate || toDate) {
      filter.admissionDate = {};
      if (fromDate) filter.admissionDate.$gte = new Date(fromDate);
      if (toDate) filter.admissionDate.$lte = new Date(toDate);
    }

    const total = await Admission.countDocuments(filter);

    const admissions = await Admission.find(filter)
      .populate("createdBy", "name email")
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
      data: admissions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id).populate(
      "createdBy updatedBy",
      "name email",
    );

    if (!admission) {
      return res.status(404).json({
        message: "Admission not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admission,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateAdmission = async (req, res) => {
  try {
    const { patientName, age, gender, admissionDate } = req.body;

    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({
        message: "Admission not found",
      });
    }

    if (age && age < 0) {
      return res.status(400).json({
        message: "Age cannot be negative",
      });
    }

    admission.patientName = patientName || admission.patientName;
    admission.age = age || admission.age;
    admission.gender = gender || admission.gender;
    admission.admissionDate = admissionDate || admission.admissionDate;
    admission.updatedBy = req.user.userId;

    await admission.save();

    res.status(200).json({
      success: true,
      message: "Admission updated successfully",
      data: admission,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({
        message: "Admission not found",
      });
    }

    await admission.deleteOne();

    res.status(200).json({
      success: true,
      message: "Admission deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
