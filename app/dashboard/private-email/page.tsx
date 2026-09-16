import { redirect } from "next/navigation";

export default function PrivateEmailRedirect() {
  redirect("/dashboard/email");
}
