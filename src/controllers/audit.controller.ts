import { Application } from 'express';
import {
  allowMemberOfCertificationAuthority,
  allowAnyone,
} from '../security/role.access';
import { IAuditService } from '../services/audit.service';

const resourceUrl = '/v1/audit';

export const AuditPaths = {
  post: resourceUrl,
  get: `${resourceUrl}/:id`,
  find: resourceUrl,
};

export function registerAuditRoutes(
  app: Application,
  auditService: IAuditService
) {
  app.post(
    AuditPaths.post,
    allowAnyone,
    auditService.submitBalanceSheetToAudit
  );
  app.get(
    AuditPaths.get,
    allowMemberOfCertificationAuthority,
    auditService.getAudit
  );
  app.get(AuditPaths.find, allowAnyone, auditService.findAudit);
}
