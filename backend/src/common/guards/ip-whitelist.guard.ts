import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIP = request.ip || request.connection.remoteAddress;

    // If no whitelist configured, allow all
    if (this.allowedIPs.length === 0) {
      return true;
    }

    // Check if IP is in whitelist
    const isAllowed = this.allowedIPs.some(allowedIP => {
      if (allowedIP.includes('/')) {
        // CIDR notation (simple implementation)
        const [network, prefix] = allowedIP.split('/');
        return this.isIPInCIDR(clientIP, network, parseInt(prefix));
      }
      return clientIP === allowedIP;
    });

    if (!isAllowed) {
      throw new ForbiddenException('Accès non autorisé depuis cette adresse IP');
    }

    return true;
  }

  private isIPInCIDR(ip: string, network: string, prefix: number): boolean {
    // Simple CIDR check (for production, use proper CIDR library)
    const ipParts = ip.split('.').map(Number);
    const networkParts = network.split('.').map(Number);
    const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;

    const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const networkNum = (networkParts[0] << 24) + (networkParts[1] << 16) + (networkParts[2] << 8) + networkParts[3];

    return (ipNum & mask) === (networkNum & mask);
  }
}