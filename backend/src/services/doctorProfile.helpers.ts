import { DoctorProfile } from "../models/DoctorProfile";
import { Errors } from "../utils/ApiError";

export async function resolveOwnDoctorProfileId(userId: string): Promise<string> {
  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) {
    throw Errors.notFound("Doctor profile");
  }
  return profile._id.toString();
}
