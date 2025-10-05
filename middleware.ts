import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { shouldIndexPath, getStaticResourceRobots } from "@/utils/seo/static-resources";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // 强制使用www版本的域名
  if (hostname === 'wanimate.io') {
    url.host = 'www.wanimate.io';
    return NextResponse.redirect(url, 301);
  }

  // 重定向旧域名到新域名
  if (hostname === 'wanimate.ai' || hostname === 'www.wanimate.ai') {
    url.host = 'www.wanimate.io';
    return NextResponse.redirect(url, 301);
  }

  // 执行 Supabase 中间件
  const response = await updateSession(request);

  // 为静态资源添加robots标签
  if (!shouldIndexPath(pathname)) {
    response.headers.set('X-Robots-Tag', getStaticResourceRobots(pathname));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
