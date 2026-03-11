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

  const { fileName, fileSize, fileType } = await req.json() as {
    fileName: string;
    fileSize: number;
    fileType: string;
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
