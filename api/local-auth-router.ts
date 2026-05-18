import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { signSessionToken, verifySessionToken } from "./kimi/session";
import { env } from "./lib/env";
import { nanoid } from "nanoid";
import * as jose from "jose";

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create a local auth JWT token
async function createLocalToken(userId: number): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret || "leadforge-local-secret-key-2026");
  return new jose.SignJWT({ userId, type: "local" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// Verify a local auth token
async function verifyLocalToken(token: string): Promise<{ userId: number } | null> {
  try {
    const secret = new TextEncoder().encode(env.appSecret || "leadforge-local-secret-key-2026");
    const { payload } = await jose.jwtVerify(token, secret, { clockTolerance: 60 });
    if (payload.type !== "local" || typeof payload.userId !== "number") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export { createLocalToken, verifyLocalToken };

// Helper: find user by ID
async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

// Helper: find user by email
async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return rows.at(0);
}

export const localAuthRouter = createRouter({
  // Register (admin-only for creating new accounts)
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        password: z.string().min(6).max(255),
        role: z.enum(["user", "admin"]).optional().default("user"),
        // If inviteToken is provided, accept invitation
        inviteToken: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Check if accepting an invitation
      if (input.inviteToken) {
        const [inv] = await getDb()
          .select()
          .from(schema.invitations)
          .where(eq(schema.invitations.token, input.inviteToken))
          .limit(1);

        if (!inv || inv.status !== "pending") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired invitation." });
        }
        if (new Date() > new Date(inv.expiresAt)) {
          await getDb()
            .update(schema.invitations)
            .set({ status: "expired" })
            .where(eq(schema.invitations.id, inv.id));
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation has expired." });
        }

        // Create user
        const hash = await hashPassword(input.password);
        const result = await getDb()
          .insert(schema.users)
          .values({
            name: input.name,
            email: input.email,
            password: hash,
            authType: "local",
            role: inv.role,
            status: "active",
            invitedBy: inv.invitedBy,
          });

        // Mark invitation as accepted
        await getDb()
          .update(schema.invitations)
          .set({ status: "accepted" })
          .where(eq(schema.invitations.id, inv.id));

        const userId = Number(result[0].insertId);
        const token = await createLocalToken(userId);
        const user = await findUserById(userId);
        return { success: true, token, user: { id: userId, name: user?.name, email: user?.email, role: user?.role } };
      }

      // Regular registration (first user can be admin, rest are users by default)
      const existingUsers = await getDb().select().from(schema.users).limit(1);
      const isFirstUser = existingUsers.length === 0;

      const existingEmail = await findUserByEmail(input.email);
      if (existingEmail) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
      }

      const hash = await hashPassword(input.password);
      const role = isFirstUser ? "admin" : input.role;

      const result = await getDb()
        .insert(schema.users)
        .values({
          name: input.name,
          email: input.email,
          password: hash,
          authType: "local",
          role,
          status: "active",
        });

      const userId = Number(result[0].insertId);
      const token = await createLocalToken(userId);
      const user = await findUserById(userId);
      return { success: true, token, user: { id: userId, name: user?.name, email: user?.email, role: user?.role } };
    }),

  // Login with email/password
  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await findUserByEmail(input.email);
      if (!user || !user.password) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }

      const valid = await comparePassword(input.password, user.password);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }

      // Update last sign in
      await getDb()
        .update(schema.users)
        .set({ lastSignInAt: new Date() })
        .where(eq(schema.users.id, user.id));

      const token = await createLocalToken(user.id);
      return {
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      };
    }),

  // Get current user (for local auth)
  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.slice(7);
    const claim = await verifyLocalToken(token);
    if (!claim) return null;

    const user = await findUserById(claim.userId);
    if (!user || user.status !== "active") return null;
    return user;
  }),

  // List all users (admin only)
  listUsers: adminQuery.query(async () => {
    return getDb()
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        status: schema.users.status,
        authType: schema.users.authType,
        createdAt: schema.users.createdAt,
        lastSignInAt: schema.users.lastSignInAt,
      })
      .from(schema.users)
      .orderBy(schema.users.createdAt);
  }),

  // Change password
  changePassword: authedQuery
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await findUserById(ctx.user.id);
      if (!user || !user.password) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot change password for OAuth accounts." });
      }

      const valid = await comparePassword(input.currentPassword, user.password);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect." });
      }

      const hash = await hashPassword(input.newPassword);
      await getDb()
        .update(schema.users)
        .set({ password: hash, updatedAt: new Date() })
        .where(eq(schema.users.id, ctx.user.id));

      return { success: true };
    }),

  // Invite a user (admin only)
  invite: adminQuery
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["user", "admin"]).default("user"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if email already has an account
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "A user with this email already exists." });
      }

      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await getDb().insert(schema.invitations).values({
        email: input.email,
        token,
        role: input.role,
        invitedBy: ctx.user.id,
        expiresAt,
      });

      return { success: true, token, expiresAt };
    }),

  // List invitations
  listInvitations: adminQuery.query(async () => {
    return getDb()
      .select()
      .from(schema.invitations)
      .orderBy(schema.invitations.createdAt);
  }),

  // Cancel invitation
  cancelInvitation: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.invitations)
        .set({ status: "expired" })
        .where(eq(schema.invitations.id, input.id));
      return { success: true };
    }),

  // Check if an invitation is valid
  checkInvite: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const [inv] = await getDb()
        .select()
        .from(schema.invitations)
        .where(eq(schema.invitations.token, input.token))
        .limit(1);

      if (!inv || inv.status !== "pending") return { valid: false };
      if (new Date() > new Date(inv.expiresAt)) return { valid: false };

      return { valid: true, email: inv.email, role: inv.role };
    }),
});
