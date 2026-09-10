import { randomUUID } from "node:crypto";
import { RealtimeEnvelope } from "./realtime.types";

export const createRealtimeEnvelope = <T>(args: {
  actorId?: string | null;
  data: T;
}): RealtimeEnvelope<T> => ({
  eventId: randomUUID(),
  occurredAt: new Date(),
  actorId: args.actorId ?? null,
  data: args.data,
});
