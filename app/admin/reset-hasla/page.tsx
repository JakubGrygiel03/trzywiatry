import { AdminForgotPasswordForm } from "@/components/admin/admin-forgot-password-form";
import { getAdminEmail } from "@/lib/admin-auth";

export default function AdminResetRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-czarny/8 bg-bialy p-8 shadow-[0_8px_30px_rgb(1_1_1/0.06)]">
        <p className="font-heading text-[10px] uppercase tracking-[0.22em] text-czerwony">Trzy Wiatry</p>
        <h1 className="mt-2 font-heading text-2xl uppercase tracking-[0.1em]">Reset hasła</h1>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-czarny/55">
          Wyślemy jednorazowy link na e-mail admina. Link ważny 1 godzinę.
        </p>
        <AdminForgotPasswordForm defaultEmail={getAdminEmail()} />
      </div>
    </div>
  );
}
