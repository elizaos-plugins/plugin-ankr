import { IDatabaseAdapter, Memory } from "@elizaos/core";
import { randomUUID } from "crypto";
import { vi } from "vitest";

/**
 * Creates a mock database adapter for testing purposes
 * @param options Configuration options for the mock adapter
 * @returns A mock implementation of IDatabaseAdapter
 */
export const createMockDatabaseAdapter = ({
  recentMessages = [],
}: {
  recentMessages?: Memory[];
} = {}): IDatabaseAdapter => {
  return {
    getParticipantsForRoom: vi.fn().mockResolvedValue([]),
    getParticipantsForAccount: vi.fn().mockResolvedValue([]),
    getRoom: vi.fn().mockResolvedValue(randomUUID()),
    getParticipantUserState: vi.fn().mockResolvedValue("FOLLOWED"),
    getMemories: vi.fn().mockResolvedValue(recentMessages),
    getGoals: vi.fn().mockResolvedValue([]),
    db: {},
    init: vi.fn(),
    close: vi.fn(),
    getAccountById: vi.fn().mockResolvedValue(null),
    createAccount: vi.fn().mockResolvedValue(true),
    getMemoryById: vi.fn().mockResolvedValue(null),
    getMemoriesByIds: vi.fn().mockResolvedValue([]),
    getMemoriesByRoomIds: vi.fn().mockResolvedValue([]),
    getCachedEmbeddings: vi.fn().mockResolvedValue([]),
    log: vi.fn(),
    getActorDetails: vi.fn().mockResolvedValue([]),
    searchMemories: vi.fn().mockResolvedValue([]),
    updateGoalStatus: vi.fn(),
    searchMemoriesByEmbedding: vi.fn().mockResolvedValue([]),
    createMemory: vi.fn(),
    removeMemory: vi.fn(),
    removeAllMemories: vi.fn(),
    countMemories: vi.fn().mockResolvedValue(0),
    updateGoal: vi.fn(),
    createGoal: vi.fn(),
    removeGoal: vi.fn(),
    removeAllGoals: vi.fn(),
    createRoom: vi.fn().mockResolvedValue(randomUUID()),
    removeRoom: vi.fn(),
    getRoomsForParticipant: vi.fn().mockResolvedValue([]),
    getRoomsForParticipants: vi.fn().mockResolvedValue([]),
    addParticipant: vi.fn().mockResolvedValue(true),
    removeParticipant: vi.fn().mockResolvedValue(true),
    setParticipantUserState: vi.fn(),
    createRelationship: vi.fn().mockResolvedValue(true),
    getRelationship: vi.fn().mockResolvedValue(null),
    getRelationships: vi.fn().mockResolvedValue([]),
    getKnowledge: vi.fn().mockResolvedValue([]),
    searchKnowledge: vi.fn().mockResolvedValue([]),
    createKnowledge: vi.fn(),
    removeKnowledge: vi.fn(),
    clearKnowledge: vi.fn(),
  };
};
