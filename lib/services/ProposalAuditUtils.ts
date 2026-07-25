/**
 * 9. 📊 管理後台 IP 智慧風險自動解析 (純 Client/Server 雙向通用工具庫)
 */
export function evaluateIpRisk(ip: string, userAgent?: string, isTeamIp?: boolean) {
  if (isTeamIp || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { level: 'TEAM' as const, label: '🇹🇼 團隊/我方連線', isHighRisk: false };
  }
  const ua = (userAgent || '').toLowerCase();
  if (ua.includes('spider') || ua.includes('bot') || ua.includes('crawler') || ua.includes('curl') || ua.includes('python')) {
    return { level: 'HIGH_RISK_VPN' as const, label: '🚨 疑慮高風險 IP [自動腳本/爬蟲]', isHighRisk: true };
  }
  return { level: 'LOCAL_TW' as const, label: '🇹🇼 台灣區域連線', isHighRisk: false };
}
