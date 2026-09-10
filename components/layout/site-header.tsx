import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";

/** Announcement + nav stick together — otherwise the black bar clips to a strip. */
export function SiteHeader() {
  return (
    <div className="sticky top-0 z-50">
      <AnnouncementBar />
      <Navbar />
    </div>
  );
}
