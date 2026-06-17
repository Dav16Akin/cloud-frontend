import { redirect } from "next/navigation";

// /privacy is an alias that scrolls to the privacy section of the legal page
export default function PrivacyPage() {
  redirect("/terms#privacy");
}
