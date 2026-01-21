-- Add Payment table to the database
CREATE TABLE IF NOT EXISTS "Payment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(255) UNIQUE NOT NULL,
  "idempotencyKey" VARCHAR(255) UNIQUE NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  "paystackRef" VARCHAR(255),
  "callbackUrl" TEXT,
  metadata JSONB,
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "partyId" UUID NOT NULL REFERENCES "Party"(id) ON DELETE CASCADE,
  "contributionId" UUID UNIQUE REFERENCES "Contribution"(id),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_ikey ON "Payment"("idempotencyKey");
CREATE INDEX IF NOT EXISTS idx_payment_ref ON "Payment"(reference);
CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment"(status);
