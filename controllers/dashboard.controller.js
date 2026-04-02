// controllers/dashboard.controller.js

import Admission from "../models/Admission.js";
import User from "../models/User.js";
import ServiceMaster from "../models/Services.js";
import AdmissionServices from "../models/AdmissionServices.js";

export const getAdminDashboard = async (req, res) => {
  try {
    // 📅 Date filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // ================= PARALLEL QUERIES =================
    const [
      totalAdmissions,
      todayAdmissions,
      monthlyAdmissions,
      totalUsers,
      totalDoctors,
      totalStaff,
      totalServices,
      revenueData,
      recentAdmissions,
      genderStats,
    ] = await Promise.all([
      // Admissions
      Admission.countDocuments(),
      Admission.countDocuments({ createdAt: { $gte: today } }),
      Admission.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),

      // Users
      User.countDocuments(),
      User.countDocuments({ role: "Doctor" }),
      User.countDocuments({ role: "Staff" }),

      // Services
      ServiceMaster.countDocuments(),

      // Revenue
      AdmissionServices.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: { $multiply: ["$rate", "$qty"] },
            },
          },
        },
      ]),

      // Recent Admissions
      Admission.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("patientName age gender createdAt"),

      // Gender distribution
      Admission.aggregate([
        {
          $group: {
            _id: "$gender",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // ================= RESPONSE =================
    res.status(200).json({
      success: true,
      data: {
        admissions: {
          total: totalAdmissions,
          today: todayAdmissions,
          thisMonth: monthlyAdmissions,
        },
        users: {
          total: totalUsers,
          doctors: totalDoctors,
          staff: totalStaff,
        },
        services: {
          total: totalServices,
        },
        revenue: {
          total: revenueData[0]?.totalRevenue || 0,
        },
        recentAdmissions,
        genderStats,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
