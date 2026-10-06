import { User } from "../models/User";
import { DoctorProfile } from "../models/DoctorProfile";
import { Department, Specialization } from "../models/Department";
import { AppointmentSlot } from "../models/AppointmentSlot";
import { Appointment } from "../models/Appointment";
import { bookAppointment } from "../services/booking.service";
import { hashPassword } from "../utils/password";

async function makeDoctor() {
  const department = await Department.create({ name: "General Medicine" });
  const specialization = await Specialization.create({ name: "GP", departmentId: department._id });
  const doctorUser = await User.create({
    email: "doctor@test.com",
    passwordHash: await hashPassword("Password123!"),
    role: "DOCTOR",
    fullName: "Dr. Test",
  });
  return DoctorProfile.create({
    userId: doctorUser._id,
    specializationId: specialization._id,
    consultationFee: 0,
    isApproved: true,
  });
}

async function makePatient(email: string) {
  return User.create({
    email,
    passwordHash: await hashPassword("Password123!"),
    role: "PATIENT",
    fullName: "Test Patient",
    isEmailVerified: true,
  });
}

describe("booking concurrency", () => {
  it("allows only one of two simultaneous bookings for the same slot to succeed", async () => {
    const doctor = await makeDoctor();
    const slot = await AppointmentSlot.create({
      doctorId: doctor._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      startTime: "10:00",
      endTime: "10:30",
      type: "ONLINE",
      status: "OPEN",
    });

    const [patientA, patientB] = await Promise.all([
      makePatient("patientA@test.com"),
      makePatient("patientB@test.com"),
    ]);

    const attempt = (patientId: string) =>
      bookAppointment({
        patientId: patientId.toString(),
        slotId: slot._id.toString(),
        problemSummary: "Headache for three days",
      });

    const results = await Promise.allSettled([
      attempt(patientA._id.toString()),
      attempt(patientB._id.toString()),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason.code).toBe("SLOT_ALREADY_BOOKED");

    const appointments = await Appointment.find({ slotId: slot._id });
    expect(appointments).toHaveLength(1);

    const refreshedSlot = await AppointmentSlot.findById(slot._id);
    expect(refreshedSlot?.status).toBe("BOOKED");
  });
});
