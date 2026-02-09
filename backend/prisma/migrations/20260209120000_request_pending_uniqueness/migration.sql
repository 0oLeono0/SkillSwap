-- Remove duplicate pending requests before adding unique index.
DELETE FROM "Request"
WHERE "status" = 'pending'
  AND "userSkillId" IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM "Request" AS "prior"
    WHERE "prior"."status" = 'pending'
      AND "prior"."userSkillId" = "Request"."userSkillId"
      AND "prior"."fromUserId" = "Request"."fromUserId"
      AND "prior"."toUserId" = "Request"."toUserId"
      AND (
        "prior"."createdAt" < "Request"."createdAt"
        OR (
          "prior"."createdAt" = "Request"."createdAt"
          AND "prior"."id" < "Request"."id"
        )
      )
  );

CREATE UNIQUE INDEX IF NOT EXISTS "Request_pending_from_to_userSkill_key"
ON "Request"("fromUserId", "toUserId", "userSkillId")
WHERE "status" = 'pending' AND "userSkillId" IS NOT NULL;
