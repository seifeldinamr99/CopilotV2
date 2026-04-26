import { prisma } from "../config/database";

export async function getOrCreatePortalUser(params: {
  supabaseUserId: string;
  email?: string;
  name?: string;
}) {
  const { supabaseUserId, email, name } = params;

  const existing = await prisma.portalUser.findUnique({ where: { supabaseUserId } });
  if (existing) {
    // Best-effort enrichment
    if ((email && existing.email !== email) || (name && existing.name !== name)) {
      return prisma.portalUser.update({
        where: { supabaseUserId },
        data: { email: email ?? existing.email, name: name ?? existing.name },
      });
    }
    return existing;
  }

  return prisma.portalUser.create({
    data: { supabaseUserId, email: email ?? null, name: name ?? null },
  });
}

