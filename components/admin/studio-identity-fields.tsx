import { AdminField, AdminInput } from "@/components/admin/ui/admin-field";
import { studioIdentity } from "@/lib/studio-identity";
import type { StudioSettings } from "@/lib/types";

export function StudioIdentityFields({ settings }: { settings: StudioSettings }) {
  const identity = studioIdentity(settings);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <AdminField label="E-mail pracowni" htmlFor="studioEmail">
        <AdminInput id="studioEmail" name="studioEmail" type="email" defaultValue={identity.email} />
      </AdminField>
      <AdminField label="Telefon" htmlFor="studioPhone">
        <AdminInput id="studioPhone" name="studioPhone" defaultValue={identity.phone} />
      </AdminField>
      <AdminField label="Adres" htmlFor="studioAddress" hint="Ulica, kod i miasto.">
        <AdminInput id="studioAddress" name="studioAddress" defaultValue={identity.address} />
      </AdminField>
      <AdminField label="NIP" htmlFor="studioNip">
        <AdminInput id="studioNip" name="studioNip" defaultValue={identity.nip} />
      </AdminField>
      <AdminField label="Konto bankowe" htmlFor="studioBankAccount">
        <AdminInput id="studioBankAccount" name="studioBankAccount" defaultValue={identity.bankAccount} />
      </AdminField>
      <AdminField label="Właściciel / sprzedawca" htmlFor="studioOwner">
        <AdminInput id="studioOwner" name="studioOwner" defaultValue={identity.owner} />
      </AdminField>
      <AdminField label="Instagram (URL)" htmlFor="studioInstagram">
        <AdminInput id="studioInstagram" name="studioInstagram" defaultValue={identity.instagram} />
      </AdminField>
      <AdminField label="Facebook (URL)" htmlFor="studioFacebook">
        <AdminInput id="studioFacebook" name="studioFacebook" defaultValue={identity.facebook} />
      </AdminField>
    </div>
  );
}
