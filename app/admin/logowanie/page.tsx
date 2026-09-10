import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminEmail } from "@/lib/admin-auth";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ zresetowano?: string; blad?: string }>;
}) {
  const store = await cookies();
  if (isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }

  const { zresetowano, blad } = await searchParams;
  const email = getAdminEmail();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-czarny/8 bg-bialy p-8 shadow-[0_8px_30px_rgb(1_1_1/0.06)]">
        <p className="font-heading text-[10px] uppercase tracking-[0.22em] text-czerwony">Trzy Wiatry</p>
        <h1 className="mt-2 font-heading text-2xl uppercase tracking-[0.1em]">Panel CMS</h1>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-czarny">
          Logowanie do zarządzania sklepem, zamówieniami i treścią strony.
        </p>
        {zresetowano ? (
          <p className="mb-5 rounded-xl bg-czerwony/10 px-3 py-2 text-sm text-czarny/80">
            Hasło zmienione. Możesz się zalogować nowym hasłem.
          </p>
        ) : null}
        <AdminLoginForm defaultEmail={email} error={blad} />
        <p className="mt-4 text-center text-xs text-czarny/45">
          Na telefonie lub laptopie wybierz w przeglądarce opcję instalacji aplikacji.
        </p>
        <p className="mt-6 text-center text-xs text-czarny/40">
          <Link href="/" className="underline-offset-2 hover:text-czerwony hover:underline">
            Wróć na stronę główną
          </Link>
        </p>
      </div>
    </div>
  );
}
