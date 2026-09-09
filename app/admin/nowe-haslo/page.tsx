import { AdminResetPasswordForm } from "@/components/admin/admin-reset-password-form";

export default async function AdminNewPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-czarny/8 bg-bialy p-8 shadow-[0_8px_30px_rgb(1_1_1/0.06)]">
        <p className="font-heading text-[10px] uppercase tracking-[0.22em] text-czerwony">Trzy Wiatry</p>
        <h1 className="mt-2 font-heading text-2xl uppercase tracking-[0.1em]">Nowe hasło</h1>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-czarny/55">
          Ustaw hasło do panelu CMS (min. 8 znaków).
        </p>
        <AdminResetPasswordForm token={token ?? ""} />
      </div>
    </div>
  );
}
