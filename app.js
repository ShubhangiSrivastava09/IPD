import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import admissionRoutes from "./routes/admission.routes.js";
import serviceRoutes from "./routes/services.routes.js";
import userRoutes from "./routes/user.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import admissionServicesRoutes from "./routes/admissionService.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admissions-services", admissionServicesRoutes);

app.use("/api/billing", billingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;
