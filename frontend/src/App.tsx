import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./auth/ProtectedRoute";

import { Landing } from "./pages/public/Landing";
import { Login } from "./pages/public/Login";
import { Register } from "./pages/public/Register";
import { ForgotPassword } from "./pages/public/ForgotPassword";
import { ResetPassword } from "./pages/public/ResetPassword";
import { VerifyEmail } from "./pages/public/VerifyEmail";
import { DoctorSearch } from "./pages/public/DoctorSearch";
import { DoctorProfilePage } from "./pages/public/DoctorProfilePage";
import { PrivacyPolicy } from "./pages/public/PrivacyPolicy";
import { TermsAndConditions } from "./pages/public/TermsAndConditions";
import { CookiePolicy } from "./pages/public/CookiePolicy";
import { RefundPolicy } from "./pages/public/RefundPolicy";
import { Contact } from "./pages/public/Contact";
import { EmergencyInfo } from "./pages/public/EmergencyInfo";
import { NotFound } from "./pages/public/NotFound";

import { PatientDashboard } from "./pages/patient/Dashboard";
import { PatientAppointments } from "./pages/patient/Appointments";
import { PatientAppointmentDetail } from "./pages/patient/AppointmentDetail";
import { PatientReports } from "./pages/patient/Reports";
import { PatientPrescriptions } from "./pages/patient/Prescriptions";
import { PatientEmergency } from "./pages/patient/Emergency";
import { PatientProfile } from "./pages/patient/Profile";

import { DoctorDashboard } from "./pages/doctor/Dashboard";
import { DoctorAppointments } from "./pages/doctor/Appointments";
import { DoctorAppointmentDetail } from "./pages/doctor/AppointmentDetail";
import { DoctorAvailability } from "./pages/doctor/Availability";
import { DoctorProfile } from "./pages/doctor/Profile";
import { DoctorEmergencyQueue } from "./pages/doctor/EmergencyQueue";

import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminDoctors } from "./pages/admin/Doctors";
import { AdminPatients } from "./pages/admin/Patients";
import { AdminDepartments } from "./pages/admin/Departments";
import { AdminAppointments } from "./pages/admin/Appointments";
import { AdminAnalytics } from "./pages/admin/Analytics";
import { AdminAuditLogs } from "./pages/admin/AuditLogs";
import { AdminProfile } from "./pages/admin/Profile";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="doctors" element={<DoctorSearch />} />
        <Route path="doctors/:id" element={<DoctorProfilePage />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="cookie-policy" element={<CookiePolicy />} />
        <Route path="refund-policy" element={<RefundPolicy />} />
        <Route path="contact" element={<Contact />} />
        <Route path="emergency-info" element={<EmergencyInfo />} />
      </Route>

      <Route element={<ProtectedRoute allow={["PATIENT"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="patient/dashboard" element={<PatientDashboard />} />
          <Route path="patient/doctors" element={<DoctorSearch />} />
          <Route path="patient/doctors/:id" element={<DoctorProfilePage />} />
          <Route path="patient/appointments" element={<PatientAppointments />} />
          <Route path="patient/appointments/:id" element={<PatientAppointmentDetail />} />
          <Route path="patient/reports" element={<PatientReports />} />
          <Route path="patient/prescriptions" element={<PatientPrescriptions />} />
          <Route path="patient/emergency" element={<PatientEmergency />} />
          <Route path="patient/profile" element={<PatientProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={["DOCTOR"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="doctor/appointments" element={<DoctorAppointments />} />
          <Route path="doctor/appointments/:id" element={<DoctorAppointmentDetail />} />
          <Route path="doctor/availability" element={<DoctorAvailability />} />
          <Route path="doctor/emergency" element={<DoctorEmergencyQueue />} />
          <Route path="doctor/profile" element={<DoctorProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={["ADMIN"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/doctors" element={<AdminDoctors />} />
          <Route path="admin/patients" element={<AdminPatients />} />
          <Route path="admin/departments" element={<AdminDepartments />} />
          <Route path="admin/appointments" element={<AdminAppointments />} />
          <Route path="admin/analytics" element={<AdminAnalytics />} />
          <Route path="admin/audit-logs" element={<AdminAuditLogs />} />
          <Route path="admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      <Route path="404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
