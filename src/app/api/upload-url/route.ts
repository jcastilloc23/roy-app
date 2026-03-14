import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

const ALLOWED_EXTENSIONS = [".csv", ".tsv", ".pdf", ".xls", ".xlsx"];

function getExtension(filename: string) {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, fileSize, fileType, fileHash } = await req.json() as {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileHash?: string;
  };

  if (!fileName) {
    return NextResponse.json({ error: "fileName is required" }, { status: 400 });
  }

  const ext = getExtension(fileName);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({
      error: "unsupported_format",
      message: `Roy only reads CSV, TSV, PDF, XLS, and XLSX files. You uploaded a ${ext} file.`,
    }, { status: 415 });
  }

  const supabase = supabaseAdmin();

  // Duplicate check — same user uploading the same file content
  if (fileHash) {
    const { data: existing } = await supabase
      .from("statements")
      .select("id, file_name, source_type, status")
      .eq("user_id", userId)
      .eq("file_hash", fileHash)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        duplicate: true,
        statementId: existing.id,
        fileName: existing.file_name,
        source: existing.source_type,
        status: existing.status,
      });
    }
  }

  const statementId = crypto.randomUUID();
  const storagePath = `${userId}/${statementId}/${fileName}`;

  // Create the statement record before generating the upload URL
  const { error: stmtError } = await supabase.from("statements").insert({
    id: statementId,
    user_id: userId,
    file_name: fileName,
    file_size: fileSize ?? null,
    file_type: fileType ?? null,
    file_url: storagePath,
    status: "pending",
    ...(fileHash ? { file_hash: fileHash } : {}),
  });

  if (stmtError) {
    return NextResponse.json({ error: `DB error: ${stmtError.message}` }, { status: 500 });
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from("statements")
    .createSignedUploadUrl(storagePath);

  if (signedUrlError || !data) {
    await supabase.from("statements").delete().eq("id", statementId);
    return NextResponse.json({ error: `Storage error: ${signedUrlError?.message}` }, { status: 500 });
  }

  return NextResponse.json({ statementId, signedUrl: data.signedUrl, token: data.token, path: storagePath });
}

// DELETE /api/upload-url — clean up an orphaned statement if the client-side upload fails
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { statementId } = await req.json() as { statementId: string };
  if (!statementId) return NextResponse.json({ error: "statementId is required" }, { status: 400 });

  const supabase = supabaseAdmin();

  // Verify ownership before deleting
  const { data: stmt } = await supabase
    .from("statements")
    .select("id, file_url, status")
    .eq("id", statementId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!stmt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only clean up pending statements — don't delete completed ones
  if (stmt.status !== "pending") {
    return NextResponse.json({ error: "Statement is not pending" }, { status: 409 });
  }

  if (stmt.file_url) {
    await supabase.storage.from("statements").remove([stmt.file_url]);
  }
  await supabase.from("statements").delete().eq("id", statementId);

  return NextResponse.json({ ok: true });
}
