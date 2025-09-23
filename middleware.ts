import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // 检查是否启用了"开发中"模式
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    // 允许访问的路径
    const allowedPaths = [
      '/', // 首页
      '/coming-soon', // 开发中页面
      '/api', // API 路由
    ];

    // 检查是否为允许的路径
    const isAllowedPath = allowedPaths.some(path =>
      url.pathname === path || url.pathname.startsWith(path + '/')
    );

    // 如果不是允许的路径，重定向到开发中页面
    if (!isAllowedPath && url.pathname !== '/coming-soon') {
      url.pathname = '/coming-soon';
      return NextResponse.redirect(url);
    }
  }

  // 继续执行原有的 Supabase 中间件
  return await updateSession(request);
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
