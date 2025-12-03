// web/src/app/core/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  let headers = req.headers;
  const token = auth.token;
  const orgId = auth.currentOrgId;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (orgId) {
    headers = headers.set('x-org-id', orgId);
  }

  const authReq = req.clone({ headers });
  return next(authReq);
};
