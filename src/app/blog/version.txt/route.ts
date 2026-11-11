// بصمة المقالات اللي انبنى عليها الموقع — deploy.yml يقارنها بالحاليّة في Supabase
// كل نصف ساعة، ويعيد النشر لو اختلفت (يعني نشرت أو عدّلت أو حذفت مقالاً).
import { blogVersion } from "@/lib/blog";

export const dynamic = "force-static";

export async function GET() {
  return new Response(await blogVersion(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
