export interface CreateRoomResult {
  roomName: string;
  roomUrl: string;
}

export interface VideoProviderAdapter {
  createRoom(input: { roomName: string; expiresAt: Date }): Promise<CreateRoomResult>;
  createMeetingToken(input: {
    roomName: string;
    userName: string;
    isOwner: boolean;
    expiresAt: Date;
  }): Promise<string>;
  deleteRoom(roomName: string): Promise<void>;
}
