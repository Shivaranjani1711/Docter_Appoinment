import { Appointment } from "../models/Appointment";
import { User } from "../models/User";
import { DoctorProfile } from "../models/DoctorProfile";
import { EmergencyRequest } from "../models/EmergencyRequest";
import { Payment } from "../models/Payment";

/**
 * Every figure here is a live aggregation against real collections. Nothing is
 * hardcoded or estimated - an empty/new deployment will correctly show zeros,
 * which the frontend renders as explicit empty states rather than invented numbers.
 */
export async function getOverviewAnalytics() {
  const [
    totalPatients,
    totalDoctors,
    approvedDoctors,
    totalAppointments,
    onlineAppointments,
    inPersonAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    emergencyTotal,
    emergencyCompleted,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments({ role: "PATIENT" }),
    DoctorProfile.countDocuments({}),
    DoctorProfile.countDocuments({ isApproved: true }),
    Appointment.countDocuments({}),
    Appointment.countDocuments({ type: "ONLINE" }),
    Appointment.countDocuments({ type: "IN_PERSON" }),
    Appointment.countDocuments({ status: "COMPLETED" }),
    Appointment.countDocuments({ status: "CANCELLED" }),
    Appointment.countDocuments({ status: "NO_SHOW" }),
    EmergencyRequest.countDocuments({}),
    EmergencyRequest.countDocuments({ status: "COMPLETED" }),
    Payment.aggregate([{ $match: { status: "SUCCESS" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  const conversionSourceCount = await Appointment.countDocuments({
    originalType: "IN_PERSON",
    type: "ONLINE",
  });

  return {
    totalPatients,
    totalDoctors,
    approvedDoctors,
    totalAppointments,
    onlineAppointments,
    inPersonAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    conversionToVideoCount: conversionSourceCount,
    appointmentConversionRate: totalAppointments > 0 ? conversionSourceCount / totalAppointments : null,
    emergencyRequestsTotal: emergencyTotal,
    emergencyRequestsCompleted: emergencyCompleted,
    totalRevenuePaise: revenueAgg[0]?.total ?? 0,
  };
}

export async function getAppointmentTrend(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await Appointment.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r) => ({ date: r._id, count: r.count }));
}

export async function getSpecializationDistribution() {
  const rows = await Appointment.aggregate([
    {
      $lookup: {
        from: "doctorprofiles",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: "$doctor" },
    {
      $lookup: {
        from: "specializations",
        localField: "doctor.specializationId",
        foreignField: "_id",
        as: "specialization",
      },
    },
    { $unwind: "$specialization" },
    { $group: { _id: "$specialization.name", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ specialization: r._id, count: r.count }));
}
