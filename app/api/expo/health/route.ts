import { isExpoOffline } from "@/app/lib/expo-config";
import { loadExpoSnapshot } from "@/app/lib/expo-snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isExpoOffline()) {
    return Response.json({ ok: true, mode: "connected" });
  }

  try {
    const snapshot = await loadExpoSnapshot({ verifyFiles: true });
    return Response.json({
      ok: true,
      mode: "expo-offline",
      generatedAt: snapshot.generatedAt,
      counts: snapshot.counts,
    });
  } catch (error) {
    return Response.json(
      { ok: false, mode: "expo-offline", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 503 },
    );
  }
}
