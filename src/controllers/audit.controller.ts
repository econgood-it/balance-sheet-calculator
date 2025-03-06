// endpoint to find audit for balance sheet
//
// GET /v1/audit?balanceSheet=id

//
// { id: number, submittedBalanceSheetId: number, auditBalanceSheetId: number }

// endpoint to get single audit
// GET /v1/audit/id

// endpoint to create audit for balance sheet
//
// POST /v1/audit with body
//
// {
//   balanceSheetToBeSubmitted: <id>
// }
//
// Does internally all the copy logic and saves the references between the balance sheets in a AuditProcessEntity or AuditEntity.

// endpoint to perform updates on audit
//
// PUT /v1/audit/7
//
// {{{}}
//
//   action: re-import
//
// }
import { Application } from 'express';
import { allowUserOnly } from './role.access';
import { IAuditService } from '../services/audit.service';

const resourceUrl = '/v1/audit';

export const AuditPaths = {
  post: `${resourceUrl}`,
};

export function registerAuditRoutes(
  app: Application,
  auditService: IAuditService
) {
  app.post(
    AuditPaths.post,
    allowUserOnly,
    auditService.submitBalanceSheetToAudit
  );
}
