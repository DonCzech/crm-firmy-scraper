import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      deals: { include: { listing: { select: { id: true, title: true } } }, orderBy: { createdAt: "desc" } },
      demands: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!person) return jsonError("Kontakt nenalezen", 404);
  return jsonOk(person);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.person.findUnique({ where: { id } });
  if (!existing) return jsonError("Kontakt nenalezen", 404);

  const { name, email, phone, type, company, address, note, gdprConsent } = body;
  const person = await prisma.person.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(type !== undefined && { type }),
      ...(company !== undefined && { company: company || null }),
      ...(address !== undefined && { address: address || null }),
      ...(note !== undefined && { note: note || null }),
      ...(gdprConsent !== undefined && {
        gdprConsent: !!gdprConsent,
        gdprConsentAt: gdprConsent ? existing.gdprConsentAt ?? new Date() : null,
      }),
    },
  });

  return jsonOk(person);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await prisma.person.delete({ where: { id } });
  return jsonOk({ deleted: true });
}
