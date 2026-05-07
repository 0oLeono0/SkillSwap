ALTER TABLE "UserSkillMaterial" ADD COLUMN "attachments" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "MaterialQuestion" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'single';
CREATE INDEX "MaterialQuestion_type_idx" ON "MaterialQuestion"("type");
