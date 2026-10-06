import type { CreateRoomResult, VideoProviderAdapter } from "./VideoProviderAdapter";

/**
 * Adapter for the public meet.jit.si service: free, open-source, no account,
 * no API key, no payment method required - unlike Daily.co, which requires a
 * card on file to actually start calls even within its free tier.
 *
 * Trade-off vs. the Daily adapter: meet.jit.si has no server-side room
 * creation API and no cryptographic per-user join tokens, so there is no way
 * to issue a signed, expiring credential the way `createMeetingToken` does
 * for Daily. Access control instead relies entirely on the room name being
 * long and unguessable (crypto.randomBytes in videoConsultation.service.ts /
 * emergency.service.ts) combined with our own server-side authorization
 * checks that gate who ever receives that room name/URL in the first place -
 * the Jitsi room itself does not authenticate joiners. This is an acceptable
 * trade-off for a demo/final-year project but is weaker than Daily's token
 * model; swap back to DailyVideoProvider (see dailyProvider.ts) if stronger
 * per-user access control is required later.
 */
export class JitsiVideoProvider implements VideoProviderAdapter {
  async createRoom(input: { roomName: string; expiresAt: Date }): Promise<CreateRoomResult> {
    // No API call needed - a meet.jit.si room is created implicitly the
    // moment the first participant opens its URL. expiresAt is accepted for
    // interface compatibility but unused: public Jitsi rooms have no
    // server-enforced expiry (our own time-window checks in
    // videoConsultation.service.ts / emergency.service.ts are what actually
    // gate access before a room URL is ever handed out).
    return { roomName: input.roomName, roomUrl: `https://meet.jit.si/${input.roomName}` };
  }

  async createMeetingToken(_input: {
    roomName: string;
    userName: string;
    isOwner: boolean;
    expiresAt: Date;
  }): Promise<string> {
    // meet.jit.si's public instance does not support JWT-based join tokens
    // (that requires a self-hosted or paid Jitsi-as-a-Service deployment).
    // Returned for interface compatibility only; callers must not treat this
    // as a real credential.
    return "";
  }

  async deleteRoom(_roomName: string): Promise<void> {
    // Nothing to clean up server-side - public Jitsi rooms are ephemeral and
    // simply stop existing once everyone leaves.
  }
}
