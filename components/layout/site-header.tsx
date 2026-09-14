import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";

/** Announcement + nav stick together — otherwise the black bar clips to a strip. */
export function SiteHeader() {
  return (
    <div
      className="site-chrome sticky top-0 z-[60]"
      style={{ backgroundColor: "#ffffff" }}
    >
      <AnnouncementBar />
      <Navbar />
    </div>
  );
}
