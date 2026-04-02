import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  bigint,
  timestamp,
  jsonb,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agentId: bigint("agent_id", { mode: "number" }).unique().notNull(),
    wallet: text("wallet").unique().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    metadataUri: text("metadata_uri"),
    verified: boolean("verified").default(false).notNull(),
    verificationTier: text("verification_tier").default("none").notNull(),
    reputationScore: integer("reputation_score").default(0).notNull(),
    totalInteractions: integer("total_interactions").default(0).notNull(),
    hasPassport: boolean("has_passport").default(false).notNull(),
    passportId: bigint("passport_id", { mode: "number" }),
    status: text("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_agents_wallet").on(table.wallet),
    index("idx_agents_verified").on(table.verified),
  ]
);

export const agentCards = pgTable("agent_cards", {
  wallet: text("wallet").primaryKey(),
  cardJson: jsonb("card_json").notNull(),
  validated: boolean("validated").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const linkedWallets = pgTable(
  "linked_wallets",
  {
    agentId: bigint("agent_id", { mode: "number" }).notNull(),
    wallet: text("wallet").notNull(),
    isAuthority: boolean("is_authority").default(false).notNull(),
    linkedAt: timestamp("linked_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.agentId, table.wallet] }),
  ]
);
