import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default async function AuditLogPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const supabase = await createClient();

  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!userData?.is_admin) {
    redirect("/");
  }

  const { data: logs } = await supabase
    .from("audit_logs")
    .select(
      `
      id,
      action,
      target_type,
      target_id,
      details,
      created_at,
      admin:users!audit_logs_admin_id_fkey(
        username,
        display_name
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">
          All moderation actions and administrative changes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No audit logs yet
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const adminData = Array.isArray(log.admin)
                  ? log.admin[0]
                  : log.admin;

                return (
                  <div
                    key={log.id}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            log.action.includes("hide")
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                              : log.action.includes("warn")
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          }`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {log.target_type}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-medium">
                        {adminData?.display_name || "Admin"}
                      </span>
                      <span className="text-muted-foreground">
                        @{adminData?.username || "admin"}
                      </span>
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-2 rounded bg-muted p-2 text-xs">
                        {log.details.reason && (
                          <p>
                            <span className="font-medium">Reason:</span>{" "}
                            {log.details.reason}
                          </p>
                        )}
                        {log.details.action_taken && (
                          <p>
                            <span className="font-medium">Action:</span>{" "}
                            {log.details.action_taken}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
