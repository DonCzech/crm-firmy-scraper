"use client";

import { useState } from "react";
import { SettingsLayout } from "./SettingsLayout";
import { FormRow, Input, SectionHeader, SaveButton, StatusMessage, Card } from "./ui";
import type { Tenant } from "@/lib/db";

interface Props {
  tenant: Tenant;
}

interface BillingData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  company_name?: string;
  ic?: string;
  dic?: string;
}

export function BillingAddressSettings({ tenant }: Props) {
  const stored = (tenant.billing_data ?? {}) as BillingData;
  const [firstName, setFirstName] = useState(stored.first_name ?? "");
  const [lastName, setLastName] = useState(stored.last_name ?? "");
  const [email, setEmail] = useState(stored.email ?? tenant.email);
  const [phone, setPhone] = useState(stored.phone ?? "");
  const [street, setStreet] = useState(stored.street ?? "");
  const [city, setCity] = useState(stored.city ?? "");
  const [postalCode, setPostalCode] = useState(stored.postal_code ?? "");
  const [country, setCountry] = useState(stored.country ?? "CZ");
  const [companyName, setCompanyName] = useState(stored.company_name ?? "");
  const [ic, setIc] = useState(stored.ic ?? "");
  const [dic, setDic] = useState(stored.dic ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/demo/${tenant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_data: {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            street,
            city,
            postal_code: postalCode,
            country,
            company_name: companyName,
            ic,
            dic,
          },
        }),
      });
      if (!res.ok) { setStatus("error"); return; }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <SettingsLayout
      tenantSlug={tenant.slug}
      activeItem="Fakturace a platby"
      title="Fakturační údaje"
      actionButton={
        <div className="flex items-center gap-3">
          <StatusMessage status={status} />
          <SaveButton loading={status === "saving"} onClick={handleSave} />
        </div>
      }
    >
      <div className="max-w-3xl">
        <Card>
          <div className="px-6">
            <SectionHeader title="Kontaktní údaje" />
            <div className="grid grid-cols-2 gap-4 py-5 border-b border-white/[0.06]">
              <div>
                <label className="text-[12px] font-medium text-[#a1a1aa] mb-1.5 block">Jméno *</label>
                <Input value={firstName} onChange={setFirstName} placeholder="Jan" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#a1a1aa] mb-1.5 block">Příjmení *</label>
                <Input value={lastName} onChange={setLastName} placeholder="Novák" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#a1a1aa] mb-1.5 block">E-mail *</label>
                <Input value={email} onChange={setEmail} placeholder="jan@firma.cz" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#a1a1aa] mb-1.5 block">Telefon *</label>
                <Input value={phone} onChange={setPhone} placeholder="+420 123 456 789" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#a1a1aa] mb-1.5 block">Ulice *</label>
                <Input value={street} onChange={setStreet} placeholder="Hlavní 1" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#a1a1aa] mb-1.5 block">Město *</label>
                <Input value={city} onChange={setCity} placeholder="Praha" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#a1a1aa] mb-1.5 block">PSČ *</label>
                <Input value={postalCode} onChange={setPostalCode} placeholder="110 00" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#a1a1aa] mb-1.5 block">Země</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-[#1a1a1d] px-3 py-2 text-[13px] text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="CZ">Česká republika</option>
                  <option value="SK">Slovensko</option>
                  <option value="DE">Německo</option>
                  <option value="AT">Rakousko</option>
                  <option value="PL">Polsko</option>
                </select>
              </div>
            </div>

            <SectionHeader title="Firemní údaje" />
            <FormRow label="Název podnikání">
              <Input value={companyName} onChange={setCompanyName} placeholder="Firma s.r.o." />
            </FormRow>
            <FormRow label="IČ">
              <Input value={ic} onChange={setIc} placeholder="12345678" />
            </FormRow>
            <FormRow label="DIČ">
              <Input value={dic} onChange={setDic} placeholder="CZ12345678" />
            </FormRow>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  );
}
