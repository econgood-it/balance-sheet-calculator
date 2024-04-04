import { Workbook } from 'exceljs';
import { NextFunction, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { handle } from '../exceptions/error.handler';
import { BalanceSheetReader } from '../reader/balanceSheetReader/balance.sheet.reader';

import { diff } from 'deep-diff';
import { CalcResultsReader } from '../reader/balanceSheetReader/calc.results.reader';
import { StakeholderWeightsReader } from '../reader/balanceSheetReader/stakeholder.weights.reader';
import { TopicWeightsReader } from '../reader/balanceSheetReader/topic.weights.reader';

import { BalanceSheetExcelDiffResponseBody } from '@ecogood/e-calculator-schemas/dist/balance.sheet.diff';
import { BalanceSheetPatchRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { parseLanguageParameter } from '../language/translations';
import { IOldRepoProvider } from '../repositories/oldRepoProvider';
import { Authorization } from '../security/authorization';

export class BalanceSheetService {
  constructor(
    private dataSource: DataSource,
    private repoProvider: IOldRepoProvider
  ) {}

  public async getBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const balanceSheetEntity = await balanceSheetRepository.findByIdOrFail(
          Number(req.params.id)
        );
        Authorization.checkIfCurrentUserHasEditorPermissions(
          req,
          balanceSheetEntity
        );
        res.json(balanceSheetEntity.toJson(language));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async getMatrixRepresentationOfBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheetEntity = await balanceSheetRepository.findByIdOrFail(
          balanceSheetId
        );
        Authorization.checkIfCurrentUserHasEditorPermissions(
          req,
          balanceSheetEntity
        );

        res.json(balanceSheetEntity.asMatrixRepresentation(language));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async updateBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);

        const balanceSheetIdParam: number = Number(req.params.id);
        const balanceSheetEntity = await balanceSheetRepository.findByIdOrFail(
          balanceSheetIdParam
        );
        Authorization.checkIfCurrentUserHasEditorPermissions(
          req,
          balanceSheetEntity
        );
        const balanceSheetPatchRequestBody =
          BalanceSheetPatchRequestBodySchema.parse(req.body);
        balanceSheetEntity.mergeWithPatchRequest(balanceSheetPatchRequestBody);
        await balanceSheetEntity.reCalculate();
        await balanceSheetRepository.save(balanceSheetEntity);

        res.json(balanceSheetEntity.toJson(language));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async deleteBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheetRepository =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const balanceSheetEntity = await balanceSheetRepository.findByIdOrFail(
          balanceSheetId
        );
        Authorization.checkIfCurrentUserHasEditorPermissions(
          req,
          balanceSheetEntity
        );
        await balanceSheetRepository.remove(balanceSheetEntity);

        res.json({
          message: `Deleted balance sheet with id ${balanceSheetId}`,
        });
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async diffBetweenUploadApiBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (req.file) {
        const wb = await new Workbook().xlsx.load(req.file.buffer);
        const balanceSheetReader = new BalanceSheetReader();
        const calcResultsReader = new CalcResultsReader();
        const topicWeightsReader = new TopicWeightsReader();
        const stakeholderWeightsReader = new StakeholderWeightsReader();

        const balanceSheetEntityUpload =
          balanceSheetReader.readFromWorkbook(wb);
        const calcResultsUpload = calcResultsReader.readFromWorkbook(wb);
        const stakeholderWeightsUpload =
          stakeholderWeightsReader.readFromWorkbook(wb);
        const topicWeightsUpload = topicWeightsReader.readFromWorkbook(wb);
        const balanceSheetEntityApi = balanceSheetEntityUpload.clone();

        const { calcResults, stakeholderWeights, topicWeights } =
          await balanceSheetEntityApi.reCalculate();

        res.json(
          BalanceSheetExcelDiffResponseBody.parse({
            lhs: 'upload',
            rhs: 'api',
            diffStakeHolderWeights:
              stakeholderWeightsUpload &&
              diff(
                Object.fromEntries(stakeholderWeightsUpload),
                Object.fromEntries(stakeholderWeights)
              ),
            diffTopicWeights:
              topicWeightsUpload &&
              diff(
                Object.fromEntries(topicWeightsUpload),
                Object.fromEntries(topicWeights)
              ),
            diffCalc: calcResultsUpload && diff(calcResultsUpload, calcResults),
            diff: balanceSheetEntityUpload.diff(balanceSheetEntityApi),
          })
        );
      } else {
        res.json({ message: 'File empty' });
      }
    } catch (error) {
      handle(error as Error, next);
    }
  }
}
