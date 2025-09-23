import { Construction, Home } from "lucide-react";
import Link from "next/link";

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-md mx-auto text-center px-6">
        {/* 图标动画 */}
        <div className="mb-8">
          <div className="relative inline-block">
            <Construction className="w-20 h-20 text-primary mx-auto animate-bounce" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          正在开发中
        </h1>

        {/* 描述 */}
        <p className="text-lg text-muted-foreground mb-8">
          我们正在努力为您打造更好的体验，<br />
          敬请期待！
        </p>

        {/* 返回首页按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          返回首页
        </Link>

        {/* 装饰元素 */}
        <div className="mt-12 opacity-30">
          <div className="text-sm text-muted-foreground">
            Rendaily · AI 驱动的设计平台
          </div>
        </div>
      </div>
    </div>
  );
}