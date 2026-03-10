import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const completeCleanup = mutation({
	args: {
		clerkId: v.string(),
		lat: v.number(),
		lng: v.number(),
		xpAwarded: v.number(),
	},
	handler: async (ctx, args) => {
		// 1. Get user by clerkId
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (!user) throw new Error("User not found");

		// 2. Add cleanup record
		const cleanupId = await ctx.db.insert("cleanups", {
			userId: user._id,
			lat: args.lat,
			lng: args.lng,
			xpAwarded: args.xpAwarded,
			timestamp: Date.now(),
		});

		// 3. Update User XP and Level
		const newXp = (user.xp || 0) + args.xpAwarded;
		let newLevel = user.level || 1;

		// Level scaling logic: 100 XP per level
		if (newXp >= newLevel * 100) {
			newLevel += 1;
		}

		const badges = user.badges || [];
		if (newLevel >= 5 && !badges.includes("Earth Hero")) {
			badges.push("Earth Hero");
		} else if (newLevel >= 2 && !badges.includes("Guardian")) {
			badges.push("Guardian");
		}

		await ctx.db.patch(user._id, {
			xp: newXp,
			level: newLevel,
			badges: badges,
		});

		return cleanupId;
	},
});

export const submitSurvey = mutation({
	args: {
		clerkId: v.string(),
		cleanupId: v.id("cleanups"),
		safetyRating: v.number(),
		accuracyRating: v.number(),
		comments: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (!user) throw new Error("User not found");

		return await ctx.db.insert("surveys", {
			userId: user._id,
			cleanupId: args.cleanupId,
			safetyRating: args.safetyRating,
			accuracyRating: args.accuracyRating,
			comments: args.comments,
			timestamp: Date.now(),
		});
	},
});

export const getUserCleanups = query({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (!user) return [];

		return await ctx.db
			.query("cleanups")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.order("desc")
			.collect();
	},
});
