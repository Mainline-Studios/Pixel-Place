import type { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const OPENCUT_PREDOMAIN = 'opencut';

let proxyMiddleware: ReturnType<typeof createProxyMiddleware> | null = null;

function getProxy() {
  const target = process.env.OPENCUT_CLOUD_RUN_URL?.trim();
  if (!target) return null;
  if (!proxyMiddleware) {
    proxyMiddleware = createProxyMiddleware({
      target,
      changeOrigin: true,
      xfwd: true,
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader('x-forwarded-host', `${OPENCUT_PREDOMAIN}.pixelplaceofficial.com`);
        },
      },
    });
  }
  return proxyMiddleware;
}

/** Route opencut.pixelplaceofficial.com to OpenCut on Cloud Run (MIT-licensed upstream). */
export function maybeProxyOpenCut(
  req: Request,
  res: Response,
  next: NextFunction,
  predomain: string,
): void {
  if (predomain !== OPENCUT_PREDOMAIN) {
    next();
    return;
  }
  const proxy = getProxy();
  if (!proxy) {
    res
      .status(503)
      .send(
        'OpenCut is not configured yet. Set OPENCUT_CLOUD_RUN_URL on Cloud Functions and redeploy.',
      );
    return;
  }
  proxy(req, res, next);
}
