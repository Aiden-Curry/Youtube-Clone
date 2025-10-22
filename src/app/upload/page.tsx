import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { UploadContainer } from "@/components/upload/upload-container";

export default async function UploadPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return <UploadContainer userId={user.id} />;
}
