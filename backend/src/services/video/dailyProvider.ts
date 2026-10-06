import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import type { CreateRoomResult, VideoProviderAdapter } from "./VideoProviderAdapter";

// Daily.co REST API adapter. Rooms are private (no public URL does anything without
// a signed meeting token) and short-lived (`exp`), so no permanent public link is
// ever created - see §7 of the architecture notes.
export class DailyVideoProvider implements VideoProviderAdapter {
  private async request<T>(path: string, body: unknown): Promise<T> {
    if (!env.DAILY_API_KEY) {
      throw new ApiError(
        503,
        "VIDEO_PROVIDER_NOT_CONFIGURED",
        "Video consultation is not configured on this server yet."
      );
    }

    const response = await fetch(`${env.DAILY_API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new ApiError(502, "VIDEO_PROVIDER_ERROR", `Video provider request failed: ${detail.slice(0, 200)}`);
    }

    return response.json() as Promise<T>;
  }

  async createRoom(input: { roomName: string; expiresAt: Date }): Promise<CreateRoomResult> {
    const result = await this.request<{ name: string; url: string }>("/rooms", {
      name: input.roomName,
      privacy: "private",
      properties: {
        exp: Math.floor(input.expiresAt.getTime() / 1000),
        enable_chat: true,
        enable_screenshare: true,
      },
    });
    return { roomName: result.name, roomUrl: result.url };
  }

  async createMeetingToken(input: {
    roomName: string;
    userName: string;
    isOwner: boolean;
    expiresAt: Date;
  }): Promise<string> {
    const result = await this.request<{ token: string }>("/meeting-tokens", {
      properties: {
        room_name: input.roomName,
        user_name: input.userName,
        is_owner: input.isOwner,
        exp: Math.floor(input.expiresAt.getTime() / 1000),
      },
    });
    return result.token;
  }

  async deleteRoom(roomName: string): Promise<void> {
    if (!env.DAILY_API_KEY) return;
    await fetch(`${env.DAILY_API_BASE_URL}/rooms/${roomName}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${env.DAILY_API_KEY}` },
    }).catch(() => undefined);
  }
}
