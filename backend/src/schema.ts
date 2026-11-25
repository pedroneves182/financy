import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { Prisma, TransactionType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./db.js";
import { createToken, hashPassword, requireUser, verifyPassword } from "./auth.js";

export interface GraphQLContext {
  userId: string | null;
}

const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase());
const passwordSchema = z.string().min(8).max(72);
const nameSchema = z.string().trim().min(1).max(60);
const descriptionSchema = z.string().trim().min(1).max(200);
const categoryDescriptionSchema = z.string().trim().max(200);
const categoryIconSchema = z.enum([
  "briefcase-business", "car-front", "heart-pulse", "piggy-bank", "shopping-cart", "ticket", "tool-case", "utensils",
  "paw-print", "house", "gift", "dumbbell", "book-open", "baggage-claim", "mailbox", "receipt-text",
]);
const categoryColorSchema = z.enum(["blue", "pink", "green", "orange", "purple", "yellow", "red"]);
const amountSchema = z.number().int().positive().max(2_147_483_647);

function validate<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new GraphQLError(result.error.issues.map((issue) => issue.message).join("; "), {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  return result.data;
}

function notFound(resource: string): never {
  throw new GraphQLError(`${resource} not found`, { extensions: { code: "NOT_FOUND" } });
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function isForeignKeyError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}

const dateTimeScalar = new GraphQLScalarType<Date, string>({
  name: "DateTime",
  description: "Date and time represented as an ISO 8601 string.",
  serialize(value) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new GraphQLError("DateTime cannot represent an invalid Date");
    }
    return value.toISOString();
  },
  parseValue(value) {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
      throw new GraphQLError("DateTime must be a valid ISO 8601 string", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING || Number.isNaN(Date.parse(ast.value))) {
      throw new GraphQLError("DateTime must be a valid ISO 8601 string", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    return new Date(ast.value);
  },
});

export const typeDefs = `#graphql
  scalar DateTime

  enum TransactionType {
    INCOME
    EXPENSE
  }

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Category {
    id: ID!
    name: String!
    description: String!
    icon: String!
    color: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Transaction {
    id: ID!
    type: TransactionType!
    description: String!
    amountCents: Int!
    occurredAt: DateTime!
    category: Category
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateTransactionInput {
    type: TransactionType!
    description: String!
    amountCents: Int!
    occurredAt: DateTime!
    categoryId: ID!
  }

  input UpdateTransactionInput {
    type: TransactionType
    description: String
    amountCents: Int
    occurredAt: DateTime
    categoryId: ID
  }

  type Query {
    me: User!
    categories: [Category!]!
    transactions: [Transaction!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(name: String!): User!
    createCategory(name: String!, description: String, icon: String, color: String): Category!
    updateCategory(id: ID!, name: String!, description: String, icon: String, color: String): Category!
    deleteCategory(id: ID!): Boolean!
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`;

export const resolvers = {
  DateTime: dateTimeScalar,
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireUser(context.userId);
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, createdAt: true } });
      if (!user) return notFound("User");
      return user;
    },
    categories: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireUser(context.userId);
      return prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } });
    },
    transactions: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireUser(context.userId);
      return prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
      });
    },
  },
  Mutation: {
    updateProfile: async (_parent: unknown, args: { name: string }, context: GraphQLContext) => {
      const userId = requireUser(context.userId);
      const name = validate(nameSchema, args.name);
      return prisma.user.update({ where: { id: userId }, data: { name }, select: { id: true, name: true, email: true, createdAt: true } });
    },
    register: async (_parent: unknown, args: { name: string; email: string; password: string }) => {
      const name = validate(nameSchema, args.name);
      const email = validate(emailSchema, args.email);
      const password = validate(passwordSchema, args.password);
      try {
        const user = await prisma.user.create({
          data: { name, email, passwordHash: await hashPassword(password) },
          select: { id: true, name: true, email: true, createdAt: true },
        });
        return { user, token: createToken(user.id) };
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new GraphQLError("An account with this email already exists", { extensions: { code: "CONFLICT" } });
        }
        throw error;
      }
    },
    login: async (_parent: unknown, args: { email: string; password: string }) => {
      const email = validate(emailSchema, args.email);
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await verifyPassword(args.password, user.passwordHash))) {
        throw new GraphQLError("Invalid email or password", { extensions: { code: "UNAUTHENTICATED" } });
      }
      return {
        token: createToken(user.id),
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      };
    },
    createCategory: async (_parent: unknown, args: { name: string; description?: string | null; icon?: string | null; color?: string | null }, context: GraphQLContext) => {
      const userId = requireUser(context.userId);
      const name = validate(nameSchema, args.name);
      const description = validate(categoryDescriptionSchema, args.description ?? "");
      const icon = validate(categoryIconSchema, args.icon ?? "briefcase-business");
      const color = validate(categoryColorSchema, args.color ?? "blue");
      try {
        return await prisma.category.create({ data: { name, description, icon, color, userId } });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new GraphQLError("A category with this name already exists", { extensions: { code: "CONFLICT" } });
        }
        throw error;
      }
    },
    updateCategory: async (_parent: unknown, args: { id: string; name: string; description?: string | null; icon?: string | null; color?: string | null }, context: GraphQLContext) => {
      const userId = requireUser(context.userId);
      const name = validate(nameSchema, args.name);
      const existing = await prisma.category.findFirst({ where: { id: args.id, userId } });
      if (!existing) return notFound("Category");
      const data: Prisma.CategoryUpdateInput = { name };
      if (args.description !== undefined) data.description = validate(categoryDescriptionSchema, args.description ?? "");
      if (args.icon !== undefined) data.icon = validate(categoryIconSchema, args.icon ?? "briefcase-business");
      if (args.color !== undefined) data.color = validate(categoryColorSchema, args.color ?? "blue");
      try {
        return await prisma.category.update({ where: { id: existing.id }, data });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new GraphQLError("A category with this name already exists", { extensions: { code: "CONFLICT" } });
        }
        throw error;
      }
    },
    deleteCategory: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const userId = requireUser(context.userId);
      const existing = await prisma.category.findFirst({ where: { id: args.id, userId } });
      if (!existing) return notFound("Category");
      await prisma.$transaction([
        prisma.transaction.updateMany({ where: { categoryId: existing.id, userId }, data: { categoryId: null } }),
        prisma.category.delete({ where: { id: existing.id } }),
      ]);
      return true;
    },
    createTransaction: async (
      _parent: unknown,
      args: { input: { type: TransactionType; description: string; amountCents: number; occurredAt: Date; categoryId: string } },
      context: GraphQLContext,
    ) => {
      const userId = requireUser(context.userId);
      const description = validate(descriptionSchema, args.input.description);
      const amountCents = validate(amountSchema, args.input.amountCents);
      const category = await prisma.category.findFirst({ where: { id: args.input.categoryId, userId } });
      if (!category) {
        throw new GraphQLError("Category not found", { extensions: { code: "BAD_USER_INPUT" } });
      }
      return prisma.transaction.create({
        data: { type: args.input.type, description, amountCents, occurredAt: args.input.occurredAt, userId, categoryId: category.id },
        include: { category: true },
      });
    },
    updateTransaction: async (
      _parent: unknown,
      args: { id: string; input: { type?: TransactionType; description?: string; amountCents?: number; occurredAt?: Date; categoryId?: string | null } },
      context: GraphQLContext,
    ) => {
      const userId = requireUser(context.userId);
      const existing = await prisma.transaction.findFirst({ where: { id: args.id, userId } });
      if (!existing) return notFound("Transaction");

      const data: Prisma.TransactionUpdateInput = {};
      if (args.input.type !== undefined) data.type = args.input.type;
      if (args.input.description !== undefined) data.description = validate(descriptionSchema, args.input.description);
      if (args.input.amountCents !== undefined) data.amountCents = validate(amountSchema, args.input.amountCents);
      if (args.input.occurredAt !== undefined) data.occurredAt = args.input.occurredAt;
      if (args.input.categoryId !== undefined) {
        if (args.input.categoryId === null) {
          data.category = { disconnect: true };
        } else {
          const category = await prisma.category.findFirst({ where: { id: args.input.categoryId, userId } });
          if (!category) {
            throw new GraphQLError("Category not found", { extensions: { code: "BAD_USER_INPUT" } });
          }
          data.category = { connect: { id: category.id } };
        }
      }
      return prisma.transaction.update({ where: { id: existing.id }, data, include: { category: true } });
    },
    deleteTransaction: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const userId = requireUser(context.userId);
      const existing = await prisma.transaction.findFirst({ where: { id: args.id, userId } });
      if (!existing) return notFound("Transaction");
      await prisma.transaction.delete({ where: { id: existing.id } });
      return true;
    },
  },
  Transaction: {
    category: (parent: { category?: unknown; categoryId?: string | null; userId: string }) => {
      if ("category" in parent) return parent.category;
      if (!parent.categoryId) return null;
      return prisma.category.findFirst({ where: { id: parent.categoryId, userId: parent.userId } });
    },
  },
};
