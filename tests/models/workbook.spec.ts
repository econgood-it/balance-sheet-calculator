import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { GroupSchema, makeWorkbook, makeWorkbookOld } from '../../src/models/workbook';

describe('Full Workbook', () => {
  it('is created from file for versions < 5.10 in English', async () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_0_9,
      BalanceSheetType.Full,
      'en'
    );
    expect(workbook.version).toEqual(BalanceSheetVersion.v5_0_9);
    expect(workbook.type).toEqual(BalanceSheetType.Full);

    expect(workbook.findByShortName('B1.2')).toEqual({
      shortName: 'B1.2',
      name: 'Common Good-orientated borrowing',
      description:
        'Any borrowing is a commitment to an increase in the added value, so as to be able to pay in' +
        'terest and make repayments. Borrowed capital should be raised primarily through solidarity ' +
        'financing, for example, subordinated loans from patrons or Crowd-funding support, as these ' +
        'sources will share the same ethos. Only then should loans with ethical banks be considered. ' +
        'Should it be necessary to take out a loan from a commercial bank, the terms and conditions of ' +
        'any additional related risks should be checked.',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.ratings).toHaveLength(80);
  });
  it('is created from file for versions < 5.10 in German', async () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_0_9,
      BalanceSheetType.Full,
      'de'
    );
    expect(workbook.version).toEqual(BalanceSheetVersion.v5_0_9);
    expect(workbook.type).toEqual(BalanceSheetType.Full);

    // The description is not yet translated, since it is not used in the e calculator
    expect(workbook.findByShortName('B1.2')).toEqual({
      shortName: 'B1.2',
      name: 'Gemeinwohlorientierte Fremdfinanzierung',
      description:
        'Any borrowing is a commitment to an increase in the added value, so as to be able to pay in' +
        'terest and make repayments. Borrowed capital should be raised primarily through solidarity ' +
        'financing, for example, subordinated loans from patrons or Crowd-funding support, as these ' +
        'sources will share the same ethos. Only then should loans with ethical banks be considered. ' +
        'Should it be necessary to take out a loan from a commercial bank, the terms and conditions of ' +
        'any additional related risks should be checked.',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.ratings).toHaveLength(80);
  });
  it('is created from file for versions >= 5.10 in English', () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_1_0,
      BalanceSheetType.Full,
      'en'
    );
    expect(workbook.version).toEqual(BalanceSheetVersion.v5_1_0);
    expect(workbook.type).toEqual(BalanceSheetType.Full);

    expect(workbook.findByShortName('A1.1')).toEqual({
      shortName: 'A1.1',
      name: 'Working conditions and social impact in the supply chain',
      description:
        'The aim is for organizations to be actively involved in how the goods and services they purchase are provided. To this end, they should take the appropriate steps to ensure fair and ethical working practices throughout the supply chain.',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.findByShortName('B1.2')).toEqual({
      shortName: 'B1.2',
      name: 'Financial independence through own funding for self-governing organizations',
      description:
        'This aspect only applies, if B1.1 does not apply. To ensure independence and autonomy for an organization, a high level of revenue from own activities enables financial independence, economic resilience and protects an organization from unwanted external influences, and from unnecessary financial risks.',
      isPositive: true,
      type: 'aspect',
    });

    expect(workbook.findByShortName('E4.3')).toEqual({
      shortName: 'E4.3',
      name: 'Negative aspect: lack of transparency and deliberate misinformation',
      description:
        'Organizations and companies have a responsibility to provide information to society transparently and comprehensively. If an organization deliberately publishes false information about itself, its plans, its understanding of facts, or its mission, it harms society and impedes informed choices and discourse. Harm can be caused by: * deliberate misleading through mis-information, non-disclosure of relevant facts, illegitimate interpretation of facts * biased reporting of risks to the detriment of the public, future generations, and nature * neglect of scientific findings or empirical facts * promotion of stereotypes, resentments, group-based misanthropy, or prejudices * gather and disseminate information with the aim of manipulation or tailored opinion forming * prevent dissemination or discredit information for strategic reasons',
      isPositive: false, // TODO: change this after json is corrected by MDT
      type: 'aspect',
    });
    expect(workbook.ratings).toHaveLength(81);
  });

  it('is created from file for versions >= 5.10 in German', () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_1_0,
      BalanceSheetType.Full,
      'de'
    );
    expect(workbook.version).toEqual(BalanceSheetVersion.v5_1_0);
    expect(workbook.type).toEqual(BalanceSheetType.Full);

    expect(workbook.findByShortName('A1.1')).toEqual({
      shortName: 'A1.1',
      name: 'Arbeitsbedingungen und soziale Auswirkungen in der Lieferkette',
      description:
        'Ziel ist es, dass Organisationen sich aktiv daran beteiligen, wie die von ihnen gekauften Waren und Dienstleistungen hergestellt werden. Zu diesem Zweck sollten sie geeignete Maßnahmen ergreifen, um faire und ethische Arbeitspraktiken in der gesamten Lieferkette sicherzustellen. ',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.findByShortName('E4.3')).toEqual({
      shortName: 'E4.3',
      name: 'Negativaspekt: Intransparenz und gezielte Falschinformation',
      description:
        'Organisationen und Unternehmen haben die Verantwortung, die Gesellschaft transparent und umfassend zu informieren. Wenn eine Organisation absichtlich falsche Informationen über sich selbst, ihre Pläne, ihr Verständnis von Fakten oder ihre Mission veröffentlicht, schadet sie dem Gemeinwesen und behindert fundierte Entscheidungen und Diskussionen. Schäden können verursacht werden durch: - bewusste Irreführung durch Fehlinformation, Verschweigen relevanter Tatsachen, tendenziöse Auslegung von Tatsachen - verzerrte Berichterstattung über Risiken zum Nachteil der Öffentlichkeit, künftiger Generationen und der Natur - Missachtung wissenschaftlicher Erkenntnisse oder empirischer Fakten - Förderung von Stereotypen, Ressentiments, gruppenbezogener Menschenfeindlichkeit oder Vorurteilen - Informationsverbreitung mit dem Ziel der Manipulation oder gezielten Meinungsbildung - Informationszurückhaltung oder Diskreditierung von Informationsquellen aus strategischen Gründen',
      isPositive: false, // TODO: change this after json is corrected by MDT
      type: 'aspect',
    });
    expect(workbook.ratings).toHaveLength(81);
  });

  it('is created from file for version < 5.10 and returned as json', () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_0_8,
      BalanceSheetType.Full,
      'de'
    );
    const json = workbook.toJson();
    expect(json).toEqual({
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      groups: [
        { shortName: 'A', name: 'Lieferant*innen' },
        {
          shortName: 'B',
          name: 'Eigentümer*innen und Finanzpartner*innen',
        },
        { shortName: 'C', name: 'Mitarbeitende' },
        { shortName: 'D', name: 'Kund*innen und Mitunternehmen' },
        { shortName: 'E', name: 'Gesellschaftliches Umfeld' },
      ],
      evaluationLevels: [
        {
          level: 0,
          name: 'Vorbildlich',
          pointsFrom: 7,
          pointsTo: 10,
        },
        {
          level: 1,
          name: 'Erfahren',
          pointsFrom: 4,
          pointsTo: 6,
        },
        { level: 2, name: 'Fortgeschritten', pointsFrom: 2, pointsTo: 3 },
        {
          level: 3,
          name: 'Erste Schritte',
          pointsFrom: 1,
          pointsTo: 1,
        },
        { level: 4, name: 'Basislinie', pointsFrom: 0, pointsTo: 0 },
      ],
    });
  });

  it('is created from file for version >= 5.10 and returned as json', () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_1_0,
      BalanceSheetType.Full,
      'de'
    );
    const json = workbook.toJson();
    expect(json).toEqual({
      version: BalanceSheetVersion.v5_1_0,
      type: BalanceSheetType.Full,
      groups: [
        { shortName: 'A', name: 'Lieferant\\*innen' },
        {
          shortName: 'B',
          name: 'Eigentümer\\*innen, Eigenkapital- und Finanzpartner\\*innen',
        },
        { shortName: 'C', name: 'Mitarbeitende und Arbeitspartner\\*innen' },
        { shortName: 'D', name: 'Kund\\*innen und Geschäftspartner\\*innen ' },
        { shortName: 'E', name: 'Globale Gemeinschaft, Natur und Lebewesen' },
      ],
      evaluationLevels: [
        {
          level: 0,
          name: 'Basislinie',
          pointsFrom: 0,
          pointsTo: 0,
        },
        {
          level: 1,
          name: 'Erste Schritte',
          pointsFrom: 1,
          pointsTo: 1,
        },
        { level: 2, name: 'Fortgeschritten', pointsFrom: 2, pointsTo: 3 },
        {
          level: 3,
          name: 'Erfahren',
          pointsFrom: 4,
          pointsTo: 6,
        },
        { level: 4, name: 'Vorbildlich', pointsFrom: 7, pointsTo: 10 },
      ],
    });
  });
});

describe('Compact Workbook', () => {
  it('is created from file for versions < 5.10 in English', async () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_0_9,
      BalanceSheetType.Compact,
      'en'
    );
    expect(workbook.version).toEqual(BalanceSheetVersion.v5_0_9);
    expect(workbook.type).toEqual(BalanceSheetType.Compact);

    expect(workbook.findByShortName('B1.1')).toEqual({
      shortName: 'B1.1',
      name: 'Ethical position in relation to financial resources',
      description:
        'A high level of internal equity capital enables financial independence, ' +
        'economic resilience and protects the company from unwanted external ' +
        'influences and especially from unnecessary financial risks.',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.ratings).toHaveLength(59);
  });
  it('is created from file for versions < 5.10 in German', async () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_0_9,
      BalanceSheetType.Compact,
      'de'
    );
    expect(workbook.version).toEqual(BalanceSheetVersion.v5_0_9);
    expect(workbook.type).toEqual(BalanceSheetType.Compact);

    // The description is not yet translated, since it is not used in the e calculator
    expect(workbook.findByShortName('B1.1')).toEqual({
      shortName: 'B1.1',
      name: 'Ethische Haltung im Umgang mit Geldmitteln',
      description:
        'A high level of internal equity capital enables financial independence, ' +
        'economic resilience and protects the company from unwanted external ' +
        'influences and especially from unnecessary financial risks.',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.ratings).toHaveLength(59);
  });
  it('is created from file for version >= 5.10 in English', () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_1_0,
      BalanceSheetType.Compact,
      'en'
    );

    expect(workbook.version).toEqual(BalanceSheetVersion.v5_1_0);
    expect(workbook.type).toEqual(BalanceSheetType.Compact);

    expect(workbook.findByShortName('A1.1')).toEqual({
      shortName: 'A1.1',
      name: 'Working conditions and social impact in the supply chain',
      description:
        'The aim is for organizations to be actively involved in how the goods and services they purchase are provided. To this end, they should take the appropriate steps to ensure fair and ethical working practices throughout the supply chain.',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.findByShortName('B1.2')).toEqual({
      shortName: 'B1.2',
      name: 'Financial independence through own funding for self-governing organizations',
      description:
        'This aspect only applies, if B1.1 does not apply. To ensure independence and autonomy for an organization, a high level of revenue from own activities enables financial independence, economic resilience and protects an organization from unwanted external influences, and from unnecessary financial risks.',
      isPositive: true,
      type: 'aspect',
    });

    expect(workbook.findByShortName('E4.3')).toEqual({
      shortName: 'E4.3',
      name: 'Negative aspect: lack of transparency and deliberate misinformation',
      description:
        'Organizations and companies have a responsibility to provide information to society transparently and comprehensively. If an organization deliberately publishes false information about itself, its plans, its understanding of facts, or its mission, it harms society and impedes informed choices and discourse. Harm can be caused by: * deliberate misleading through mis-information, non-disclosure of relevant facts, illegitimate interpretation of facts * biased reporting of risks to the detriment of the public, future generations, and nature * neglect of scientific findings or empirical facts * promotion of stereotypes, resentments, group-based misanthropy, or prejudices   * gather and disseminate information with the aim of manipulation or tailored opinion forming * prevent dissemination or discredit information for strategic reasons',
      isPositive: false,
      type: 'aspect',
    });
    expect(workbook.ratings).toHaveLength(81);

    expect(workbook.evaluationLevels).toEqual([
      {
        level: 0,
        name: 'Exemplary',
        pointsFrom: 7,
        pointsTo: 10,
      },
      {
        level: 1,
        name: 'Experienced',
        pointsFrom: 4,
        pointsTo: 6,
      },
      {
        level: 2,
        name: 'Advanced',
        pointsFrom: 2,
        pointsTo: 3,
      },
      {
        level: 3,
        name: 'First Steps',
        pointsFrom: 1,
        pointsTo: 1,
      },
      {
        level: 4,
        name: 'Baseline',
        pointsFrom: 0,
        pointsTo: 0,
      },
    ]);
  });

  it('is created from file for versions >= 5.10 in German', () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_1_0,
      BalanceSheetType.Compact,
      'de'
    );
    expect(workbook.version).toEqual(BalanceSheetVersion.v5_1_0);
    expect(workbook.type).toEqual(BalanceSheetType.Compact);

    expect(workbook.findByShortName('A1.1')).toEqual({
      shortName: 'A1.1',
      name: 'Arbeitsbedingungen und soziale Auswirkungen in der Lieferkette',
      description:
        'Ziel ist es, dass Organisationen sich aktiv daran beteiligen, wie die von ihnen gekauften Waren und Dienstleistungen hergestellt werden. Zu diesem Zweck sollten sie geeignete Maßnahmen ergreifen, um faire und ethische Arbeitspraktiken in der gesamten Lieferkette sicherzustellen. ',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.findByShortName('E4.3')).toEqual({
      shortName: 'E4.3',
      name: 'Negativaspekt: Intransparenz und gezielte Falschinformation',
      description:
        'Organisationen und Unternehmen haben die Verantwortung, die Gesellschaft transparent und umfassend zu informieren. Wenn eine Organisation absichtlich falsche Informationen über sich selbst, ihre Pläne, ihr Verständnis von Fakten oder ihre Mission veröffentlicht, schadet sie dem Gemeinwesen und behindert fundierte Entscheidungen und Diskussionen. Schäden können verursacht werden durch: - bewusste Irreführung durch Fehlinformation, Verschweigen relevanter Tatsachen, tendenziöse Auslegung von Tatsachen - verzerrte Berichterstattung über Risiken zum Nachteil der Öffentlichkeit, künftiger Generationen und der Natur - Missachtung wissenschaftlicher Erkenntnisse oder empirischer Fakten - Förderung von Stereotypen, Ressentiments, gruppenbezogener Menschenfeindlichkeit oder Vorurteilen - Informationsverbreitung mit dem Ziel der Manipulation oder gezielten Meinungsbildung - Informationszurückhaltung oder Diskreditierung von Informationsquellen aus strategischen Gründen',
      isPositive: false,
      type: 'aspect',
    });
    expect(workbook.ratings).toHaveLength(81);
  });

  it('is created from file for version >= 5.10 from the API in English', () => {
    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_1_0,
      BalanceSheetType.Compact,
      'en'
    );

 /*    console.log(workbook); */

    expect(workbook.version).toEqual(BalanceSheetVersion.v5_1_0);
    expect(workbook.type).toEqual(BalanceSheetType.Compact);

    expect(workbook.findByShortName('A1.1')).toEqual({
      shortName: 'A1.1',
      name: 'Working conditions and social impact in the supply chain',
      description:
        'The aim is for organizations to be actively involved in how the goods and services they purchase are provided. To this end, they should take the appropriate steps to ensure fair and ethical working practices throughout the supply chain.',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.findByShortName('B1.2')).toEqual({
      shortName: 'B1.2',
      name: 'Financial independence through own funding for self-governing organizations',
      description:
        'This aspect only applies, if B1.1 does not apply. To ensure independence and autonomy for an organization, a high level of revenue from own activities enables financial independence, economic resilience and protects an organization from unwanted external influences, and from unnecessary financial risks.',
      isPositive: true,
      type: 'aspect',
    });

    expect(workbook.findByShortName('E4.3')).toEqual({
      shortName: 'E4.3',
      name: 'Negative aspect: lack of transparency and deliberate misinformation',
      description:
        'Organizations and companies have a responsibility to provide information to society transparently and comprehensively. If an organization deliberately publishes false information about itself, its plans, its understanding of facts, or its mission, it harms society and impedes informed choices and discourse. Harm can be caused by: * deliberate misleading through mis-information, non-disclosure of relevant facts, illegitimate interpretation of facts * biased reporting of risks to the detriment of the public, future generations, and nature * neglect of scientific findings or empirical facts * promotion of stereotypes, resentments, group-based misanthropy, or prejudices * gather and disseminate information with the aim of manipulation or tailored opinion forming * prevent dissemination or discredit information for strategic reasons',
      isPositive: false,
      type: 'aspect',
    });
    expect(workbook.ratings).toHaveLength(81);

    expect(workbook.evaluationLevels).toEqual([
      {
        level: 0,
        name: 'Baseline',
        pointsFrom: 0,
        pointsTo: 0,
      },
      {
        level: 1,
        name: 'First Steps',
        pointsFrom: 1,
        pointsTo: 1,
      },
      {
        level: 2,
        name: 'Advanced',
        pointsFrom: 2,
        pointsTo: 3,
      },
      {
        level: 3,
        name: 'Experienced',
        pointsFrom: 4,
        pointsTo: 6,
      },
      {
        level: 4,
        name: 'Exemplary',
        pointsFrom: 7,
        pointsTo: 10,
      },
    ]);
  });
});

describe('Workbook group', () => {
  it('is parsed correctly', async () => {
    const group = {
      group: {
        label: 'A',
        shortName: 'A',
        name: 'A. Suppliers',
        values: [
          {
            label: '1',
            shortName: '1_A',
            name: 'Human dignity',
            topics: {
              type: 'topic',
              label: 'A1',
              shortName: 'A1',
              name: 'A1 Human dignity throughout the supply chain',
              description:
                'All goods and services purchased by an organization have an associated impact on society, which can be either positive or negative. Of these, one of the most important is the working conditions of all employees throughout the supply chain. An organization is responsible for the well-being of all people - including its direct and indirect suppliers.',
              ecgReportComment: '',
              ecgAuditReportComment: '',
              aspects: [
                {
                  type: 'aspect',
                  label: '1.1',
                  shortName: 'A1.1',
                  name: 'A1.1 Working conditions and social impact in the supply chain',
                  isPositive: true,
                  introduction: '',
                  description:
                    'The aim is for organizations to be actively involved in how the goods and services they purchase are provided. To this end, they should take the appropriate steps to ensure fair and ethical working practices throughout the supply chain.',
                  additionalInformation: '',
                  ecgReportComment: '',
                  ecgAuditReportComment: '',
                  ecgAuditEvaluationLevel: '',
                  questions: [
                    {
                      label: 1,
                      shortName: 'A1.1.Q1',
                      question:
                        'What goods and services are purchased? What are the criteria for selecting suppliers?',
                      fullBalance: true,
                      answer: '',
                      ecgAuditReportComment: '',
                    },
                  ],
                  indicators: [
                    {
                      label: 1,
                      shortName: 'A1.1.I1',
                      indicator:
                        'Share of the externally purchased products/services out of total purchasing volume in tabular form.',
                      type: '',
                      dimension: '',
                      value: '',
                    },
                  ],
                  evaluationLevels: [
                    {
                      label: 'Exemplary',
                      shortName: 'A1.1.L4',
                      evaluation:
                        'Ethical supply management is part of the organization‘s corporate identity and positioning. Innovative procedures for ethical sourcing are implemented in all areas of business.',
                    },
                  ],
                },
                {
                  type: 'aspect',
                  label: '1.2',
                  shortName: 'A1.2',
                  name: 'A1.2 Negative aspect: violation of human dignity in the supply chain',
                  isPositive: false,
                  introduction: '',
                  description:
                    'Significant social problems can be associated with the production of many goods that are used on a daily basis. However, if one takes into consideration global, complex production processes, it is almost impossible for companies and private individuals to completely exclude all violations of human dignity.',
                  additionalInformation: '',
                  ecgReportComment: '',
                  ecgAuditReportComment: '',
                  ecgAuditEvaluationLevel: '',
                  questions: [],
                  indicators: [],
                  evaluationLevels: [],
                },
              ],
            },
          },
          {
            label: '2',
            shortName: '2_A',
            name: 'Solidarity and social justice',
            topics: {
              type: 'topic',
              label: 'A2',
              shortName: 'A2',
              name: 'A2 Solidarity and social justice throughout the supply chain',
              description:
                ' ***An ECG organization...*** - ensures that business relations with their direct suppliers are fair and just. - recognises its co-responsibility for solidarity and social justice throughout the supply chain, and develops its business practices accordingly.',
              ecgReportComment: '',
              ecgAuditReportComment: '',
              aspects: [
                {
                  type: 'aspect',
                  label: '2.1',
                  shortName: 'A2.1',
                  name: 'A2.1 Fair and just business practices towards direct suppliers',
                  isPositive: true,
                  introduction: '',
                  description:
                    'We can demonstrate solidarity and social justice towards our direct suppliers through fair and just business practices regarding pricing and terms of payment and delivery. It is also important to recognise that added value created through the supply chain must be shared fairly to facilitate an economic existence for everyone involved. ### Questions for compiling the report - To what extent have we integrated fair and just business practices towards our direct suppliers into our policies?  - To what extent have we identified actual or potential adverse impacts regarding fair and just business practices towards our direct suppliers? - (FV) What action have we taken to prevent and mitigate potential adverse impacts, bring actual adverse impacts to an end and to establish fair and just business practices towards our direct suppliers not only with regard to pricing and terms of payment and delivery, but also with regard to our daily business operations and a fair share of value added?  - (FV) To what extent have we established and are maintaining a complaints procedure for our direct suppliers? - How satisfied are our suppliers with regard to pricing and terms of payment and delivery as well as with their share of added value?  - (FV) How do we monitor the effectiveness of our policies and measures regarding fair and just business practices towards our direct suppliers?',
                  additionalInformation: '',
                  ecgReportComment: '',
                  ecgAuditReportComment: '',
                  ecgAuditEvaluationLevel: '',
                  questions: [],
                  indicators: [],
                  evaluationLevels: [],
                },
              ],
            },
          },
        ],
      },
    };
    const workbookGroup = GroupSchema.parse(group);
    expect(workbookGroup).toEqual({
      shortName: 'A',
      name: 'Suppliers',
      ratings: [
        {
          type: 'topic',
          shortName: 'A1',
          name: 'Human dignity throughout the supply chain',
          description:
            'All goods and services purchased by an organization have an associated impact on society, which can be ' +
            'either positive or negative. Of these, one of the most important is the working conditions of all employees ' +
            'throughout the supply chain. An organization is responsible for the well-being of all people - ' +
            'including its direct and indirect suppliers.',
          isPositive: true,
        },
        {
          type: 'aspect',
          shortName: 'A1.1',
          name: 'Working conditions and social impact in the supply chain',
          isPositive: true,
          description:
            'The aim is for organizations to be actively involved in how the goods and services they purchase are ' +
            'provided. To this end, they should take the appropriate steps to ensure fair and ethical working practices ' +
            'throughout the supply chain.',
        },
        {
          type: 'aspect',
          shortName: 'A1.2',
          name: 'Negative aspect: violation of human dignity in the supply chain',
          isPositive: false,
          description:
            'Significant social problems can be associated with the production of many goods that are used on a daily ' +
            'basis. However, if one takes into consideration global, complex production processes, it is almost ' +
            'impossible for companies and private individuals to completely exclude all violations of human dignity.',
        },
        {
          type: 'topic',
          shortName: 'A2',
          name: 'Solidarity and social justice throughout the supply chain',
          description:
            ' ***An ECG organization...*** - ensures that business relations with their direct suppliers are fair and ' +
            'just. - recognises its co-responsibility for solidarity and social justice throughout the supply chain, ' +
            'and develops its business practices accordingly.',
          isPositive: true,
        },
        {
          type: 'aspect',
          shortName: 'A2.1',
          isPositive: true,
          name: 'Fair and just business practices towards direct suppliers',
          description:
            'We can demonstrate solidarity and social justice towards our direct suppliers through fair and just business practices regarding pricing and terms of payment and delivery. It is also important to recognise that added value created through the supply chain must be shared fairly to facilitate an economic existence for everyone involved. ### Questions for compiling the report - To what extent have we integrated fair and just business practices towards our direct suppliers into our policies?  - To what extent have we identified actual or potential adverse impacts regarding fair and just business practices towards our direct suppliers? - (FV) What action have we taken to prevent and mitigate potential adverse impacts, bring actual adverse impacts to an end and to establish fair and just business practices towards our direct suppliers not only with regard to pricing and terms of payment and delivery, but also with regard to our daily business operations and a fair share of value added?  - (FV) To what extent have we established and are maintaining a complaints procedure for our direct suppliers? - How satisfied are our suppliers with regard to pricing and terms of payment and delivery as well as with their share of added value?  - (FV) How do we monitor the effectiveness of our policies and measures regarding fair and just business practices towards our direct suppliers?',
        },
      ],
    });
  });
});
