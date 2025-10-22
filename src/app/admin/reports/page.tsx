import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ReportActions } from "@/components/admin/report-actions";

export default async function ReportsPage() {
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

  const { data: reports } = await supabase
    .from("reports")
    .select(
      `
      id,
      reason,
      status,
      created_at,
      reporter:users!reports_reporter_id_fkey(
        username,
        display_name
      ),
      video:videos(
        id,
        title
      ),
      comment:comments(
        id,
        content,
        user:users!comments_user_id_fkey(
          username,
          display_name
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  const pendingReports = reports?.filter((r) => r.status === "pending") || [];
  const resolvedReports = reports?.filter((r) => r.status !== "pending") || [];

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Content Reports</h1>
        <p className="text-muted-foreground">
          Review and moderate reported content
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reports ({pendingReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingReports.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No pending reports
              </p>
            ) : (
              <div className="space-y-4">
                {pendingReports.map((report) => {
                  const reporterData = Array.isArray(report.reporter)
                    ? report.reporter[0]
                    : report.reporter;
                  const videoData = Array.isArray(report.video)
                    ? report.video[0]
                    : report.video;
                  const commentData = Array.isArray(report.comment)
                    ? report.comment[0]
                    : report.comment;

                  return (
                    <div
                      key={report.id}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">
                              Reported by: {reporterData?.display_name || "Unknown"}
                            </span>
                            <span className="text-muted-foreground">
                              @{reporterData?.username || "unknown"}
                            </span>
                            <span>•</span>
                            <span className="text-muted-foreground">
                              {formatDistanceToNow(new Date(report.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>

                          {videoData && (
                            <div className="mt-2">
                              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                Video
                              </span>
                              <p className="mt-1 text-sm font-medium">
                                {videoData.title}
                              </p>
                            </div>
                          )}

                          {commentData && (
                            <div className="mt-2">
                              <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                                Comment
                              </span>
                              <p className="mt-1 text-sm">{commentData.content}</p>
                              {commentData.user && (() => {
                                const userData = Array.isArray(commentData.user)
                                  ? commentData.user[0]
                                  : commentData.user;
                                return (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    by {userData?.display_name}
                                  </p>
                                );
                              })()}
                            </div>
                          )}

                          <div className="mt-2">
                            <p className="text-sm">
                              <span className="font-medium">Reason:</span>{" "}
                              {report.reason}
                            </p>
                          </div>
                        </div>
                      </div>

                      <ReportActions
                        reportId={report.id}
                        videoId={videoData?.id}
                        commentId={commentData?.id}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolved Reports ({resolvedReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {resolvedReports.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No resolved reports
              </p>
            ) : (
              <div className="space-y-4">
                {resolvedReports.slice(0, 10).map((report) => {
                  const reporterData = Array.isArray(report.reporter)
                    ? report.reporter[0]
                    : report.reporter;
                  const videoData = Array.isArray(report.video)
                    ? report.video[0]
                    : report.video;
                  const commentData = Array.isArray(report.comment)
                    ? report.comment[0]
                    : report.comment;

                  return (
                    <div
                      key={report.id}
                      className="rounded-lg border p-4 opacity-60"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            report.status === "resolved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                          }`}
                        >
                          {report.status}
                        </span>
                        <span>
                          {videoData ? "Video" : "Comment"} reported by{" "}
                          {reporterData?.display_name}
                        </span>
                        <span>•</span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(report.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
