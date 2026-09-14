"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/constants";
import { drawerTransition, fadeTransition, motionEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

export function MobileNav({
  links,
  accountHref = "/konto/logowanie",
}: {
  links: readonly NavLink[];
  accountHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const loggedIn = accountHref === "/konto";
  const quiet = !mounted || Boolean(reduceMotion);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative z-[60] flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
          open
            ? "border-czerwony/35 bg-krem text-czerwony"
            : "border-czarny/10 text-czarny hover:border-czarny/25",
        )}
      >
        {open ? <X className="h-4 w-4" strokeWidth={1.75} /> : <Menu className="h-4 w-4" strokeWidth={1.75} />}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-hidden border-t border-czarny/8 bg-nav"
            style={{ top: "var(--site-chrome)" }}
            initial={quiet ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={quiet ? undefined : { opacity: 0, y: -6 }}
            transition={quiet ? { duration: 0 } : drawerTransition}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 85% 50% at 100% 0%, rgb(156 100 78 / 0.09), transparent 55%)",
              }}
            />

            <div className="relative flex min-h-0 flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
              <nav className="tw-scroll min-h-0 flex-1 overflow-y-auto">
                <ul className="divide-y divide-czarny/10 border-y border-czarny/10">
                  {links.map((link, index) => {
                    const active =
                      pathname === link.href ||
                      (link.href !== "/" && pathname.startsWith(`${link.href}/`));
                    return (
                      <motion.li
                        key={link.href}
                        initial={quiet ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={
                          quiet
                            ? { duration: 0 }
                            : { ...fadeTransition, delay: 0.03 + index * 0.04, ease: motionEase }
                        }
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center justify-between gap-4 py-3.5 transition-colors",
                            active ? "text-czerwony" : "text-czarny hover:text-czerwony",
                          )}
                        >
                          <span className="font-heading text-[15px] uppercase tracking-[0.14em]">
                            {link.label}
                          </span>
                          <span
                            className={cn(
                              "font-heading text-[11px] tabular-nums tracking-[0.18em]",
                              active ? "text-czerwony/70" : "text-czarny/30",
                            )}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <motion.div
                className="mt-8 space-y-5"
                initial={quiet ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={quiet ? { duration: 0 } : { ...fadeTransition, delay: 0.18 }}
              >
                <Link
                  href={accountHref}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "inline-flex font-heading text-[13px] uppercase tracking-[0.18em] transition-colors",
                    loggedIn
                      ? "text-czarny underline decoration-czerwony/40 underline-offset-4 hover:text-czerwony"
                      : "text-czerwony underline decoration-czerwony/35 underline-offset-4 hover:text-czarny",
                  )}
                >
                  {loggedIn ? "Moje konto" : "Zaloguj się"}
                </Link>

                <div className="flex items-center gap-3 text-[12px] tracking-wide text-czarny/45">
                  <a href={SITE.instagram} target="_blank" rel="noreferrer" className="hover:text-czerwony">
                    Instagram
                  </a>
                  <span aria-hidden>·</span>
                  <a href={`mailto:${SITE.email}`} className="truncate hover:text-czerwony">
                    {SITE.email}
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
