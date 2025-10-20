"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCreditsPricingTable, CREDITS_PACKAGES } from "@/config/credits-pricing";

export function CreditsPricingTable() {
  const pricingTable = getCreditsPricingTable();

  return (
    <div className="space-y-8">
      {/* 积分消耗规则 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💎 积分消耗规则
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            根据视频分辨率和时长消耗不同数量的积分
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">分辨率</th>
                  <th className="text-center p-3 font-medium">5秒视频</th>
                  <th className="text-center p-3 font-medium">10秒视频</th>
                  <th className="text-left p-3 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <Badge variant="secondary">480p</Badge>
                  </td>
                  <td className="text-center p-3 font-mono">5 积分</td>
                  <td className="text-center p-3 font-mono">10 积分</td>
                  <td className="p-3 text-sm text-muted-foreground">标清画质，快速生成</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <Badge variant="default">720p</Badge>
                  </td>
                  <td className="text-center p-3 font-mono">10 积分</td>
                  <td className="text-center p-3 font-mono">20 积分</td>
                  <td className="p-3 text-sm text-muted-foreground">高清画质，平衡质量与速度</td>
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="p-3">
                    <Badge variant="destructive">1080p</Badge>
                  </td>
                  <td className="text-center p-3 font-mono">15 积分</td>
                  <td className="text-center p-3 font-mono">30 积分</td>
                  <td className="p-3 text-sm text-muted-foreground">全高清画质，专业级输出</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 积分套餐 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 积分套餐选择
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            选择适合你需求的积分套餐，积分永不过期
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(CREDITS_PACKAGES).map(([key, pkg]) => (
              <div 
                key={key}
                className={`p-4 rounded-lg border-2 ${
                  key === 'base' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                } transition-colors`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    {key === 'base' && (
                      <Badge variant="default">推荐</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">${pkg.price}</div>
                    <div className="text-sm text-muted-foreground">
                      {pkg.credits} 积分
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">约 {pkg.estimatedVideos} 条视频</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pkg.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💡 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">积分特点</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 积分永不过期</li>
                <li>• 支持所有分辨率</li>
                <li>• 按需消耗，灵活使用</li>
                <li>• 可随时购买补充</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">选择建议</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Trial</strong>: 新用户测试</li>
                <li>• <strong>Base</strong>: 日常创作使用</li>
                <li>• <strong>Pro</strong>: 大量内容制作</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}