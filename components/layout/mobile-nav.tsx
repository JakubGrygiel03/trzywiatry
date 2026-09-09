"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { fadeTransition } from "@/lib/motion";

type NavLink = { href: string; label: string };

export function MobileNav({
  links,
  accountHref = "/konto/logowanie",
}: {
  links: readonly NavLink[];
  accountHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-czarny/10 transition-colors hover:border-czarny/25"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="absolute left-0 right-0 top-full z-40 border-b border-czarny/10 bg-nav px-5 py-6"
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={reduceMotion ? { duration: 0 } : fadeTransition}
          >
            <nav className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-heading text-base uppercase tracking-[0.12em] text-czarny transition-colors hover:text-czerwony"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={accountHref}
                onClick={() => setOpen(false)}
                className="font-heading text-base uppercase tracking-[0.12em] text-szary transition-colors hover:text-czerwony"
              >
                {accountHref === "/konto" ? "Konto" : "Zaloguj"}
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
