import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		clerkId: v.string(),
		email: v.string(),
		name: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		createdAt: v.number(),
		xp: v.optional(v.number()),
		level: v.optional(v.number()),
		badges: v.optional(v.array(v.string())),
	}).index("by_clerk_id", ["clerkId"]),

	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
	}),

	cleanups: defineTable({
		userId: v.id("users"),
		lat: v.number(),
		lng: v.number(),
		xpAwarded: v.number(),
		timestamp: v.number(),
	}).index("by_user", ["userId"]),

	surveys: defineTable({
		userId: v.id("users"),
		cleanupId: v.id("cleanups"),
		safetyRating: v.number(),
		accuracyRating: v.number(),
		comments: v.optional(v.string()),
		timestamp: v.number(),
	}).index("by_user", ["userId"]),
});
