import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { GroupSchema, makeWorkbook } from '../../src/models/workbook';

describe('Workbook', () => {
  it('is created from file in English', () => {
    const workbook = makeWorkbook.fromFile(BalanceSheetVersion.v5_1_0, 'en');
    expect(workbook.version).toEqual(BalanceSheetVersion.v5_1_0);
    expect(workbook.findByShortName('A1.1')).toEqual({
      shortName: 'A1.1',
      name: 'A1.1 Working conditions and social impact in the supply chain',
      description:
        'The aim is for organizations to be actively involved in how the goods and services they purchase are provided. To this end, they should take the appropriate steps to ensure fair and ethical working practices throughout the supply chain.',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.findByShortName('E4.3')).toEqual({
      shortName: 'E4.3',
      name: 'E4.3 Negative aspect: lack of transparency and deliberate misinformation',
      description:
        'Organizations and companies have a responsibility to provide information to society transparently and comprehensively. If an organization deliberately publishes false information about itself, its plans, its understanding of facts, or its mission, it harms society and impedes informed choices and discourse. Harm can be caused by: * deliberate misleading through mis-information, non-disclosure of relevant facts, illegitimate interpretation of facts * biased reporting of risks to the detriment of the public, future generations, and nature * neglect of scientific findings or empirical facts * promotion of stereotypes, resentments, group-based misanthropy, or prejudices   * gather and disseminate information with the aim of manipulation or tailored opinion forming * prevent dissemination or discredit information for strategic reasons',
      isPositive: true, // TODO: change this after json is corrected by MDT
      type: 'aspect',
    });
  });

  it('is created from file in German', () => {
    const workbook = makeWorkbook.fromFile(BalanceSheetVersion.v5_1_0, 'de');
    expect(workbook.version).toEqual(BalanceSheetVersion.v5_1_0);
    expect(workbook.findByShortName('A1.1')).toEqual({
      shortName: 'A1.1',
      name: 'A1.1 Arbeitsbedingungen und soziale Auswirkungen in der Lieferkette',
      description:
        'Ziel ist es, dass Organisationen sich aktiv daran beteiligen, wie die von ihnen gekauften Waren und Dienstleistungen hergestellt werden. Zu diesem Zweck sollten sie geeignete Maßnahmen ergreifen, um faire und ethische Arbeitspraktiken in der gesamten Lieferkette sicherzustellen. ',
      isPositive: true,
      type: 'aspect',
    });
    expect(workbook.findByShortName('E4.3')).toEqual({
      shortName: 'E4.3',
      name: 'E4.3 Negativaspekt: Intransparenz und gezielte Falschinformation',
      description:
        'Organisationen und Unternehmen haben die Verantwortung, die Gesellschaft transparent und umfassend zu informieren. Wenn eine Organisation absichtlich falsche Informationen über sich selbst, ihre Pläne, ihr Verständnis von Fakten oder ihre Mission veröffentlicht, schadet sie dem Gemeinwesen und behindert fundierte Entscheidungen und Diskussionen. Schäden können verursacht werden durch: - bewusste Irreführung durch Fehlinformation, Verschweigen relevanter Tatsachen, tendenziöse Auslegung von Tatsachen - verzerrte Berichterstattung über Risiken zum Nachteil der Öffentlichkeit, künftiger Generationen und der Natur - Missachtung wissenschaftlicher Erkenntnisse oder empirischer Fakten - Förderung von Stereotypen, Ressentiments, gruppenbezogener Menschenfeindlichkeit oder Vorurteilen - Informationsverbreitung mit dem Ziel der Manipulation oder gezielten Meinungsbildung - Informationszurückhaltung oder Diskreditierung von Informationsquellen aus strategischen Gründen',
      isPositive: true, // TODO: change this after json is corrected by MDT
      type: 'aspect',
    });
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
      name: 'A. Suppliers',
      ratings: [
        {
          type: 'topic',
          shortName: 'A1',
          name: 'A1 Human dignity throughout the supply chain',
          description:
            'All goods and services purchased by an organization have an associated impact on society, which can be either positive or negative. Of these, one of the most important is the working conditions of all employees throughout the supply chain. An organization is responsible for the well-being of all people - including its direct and indirect suppliers.',
        },
        {
          type: 'aspect',
          shortName: 'A1.1',
          name: 'A1.1 Working conditions and social impact in the supply chain',
          isPositive: true,
          description:
            'The aim is for organizations to be actively involved in how the goods and services they purchase are provided. To this end, they should take the appropriate steps to ensure fair and ethical working practices throughout the supply chain.',
        },
        {
          type: 'aspect',
          shortName: 'A1.2',
          name: 'A1.2 Negative aspect: violation of human dignity in the supply chain',
          isPositive: false,
          description:
            'Significant social problems can be associated with the production of many goods that are used on a daily basis. However, if one takes into consideration global, complex production processes, it is almost impossible for companies and private individuals to completely exclude all violations of human dignity.',
        },
        {
          type: 'topic',
          shortName: 'A2',
          name: 'A2 Solidarity and social justice throughout the supply chain',
          description:
            ' ***An ECG organization...*** - ensures that business relations with their direct suppliers are fair and just. - recognises its co-responsibility for solidarity and social justice throughout the supply chain, and develops its business practices accordingly.',
        },
        {
          type: 'aspect',
          shortName: 'A2.1',
          isPositive: true,
          name: 'A2.1 Fair and just business practices towards direct suppliers',
          description:
            'We can demonstrate solidarity and social justice towards our direct suppliers through fair and just business practices regarding pricing and terms of payment and delivery. It is also important to recognise that added value created through the supply chain must be shared fairly to facilitate an economic existence for everyone involved. ### Questions for compiling the report - To what extent have we integrated fair and just business practices towards our direct suppliers into our policies?  - To what extent have we identified actual or potential adverse impacts regarding fair and just business practices towards our direct suppliers? - (FV) What action have we taken to prevent and mitigate potential adverse impacts, bring actual adverse impacts to an end and to establish fair and just business practices towards our direct suppliers not only with regard to pricing and terms of payment and delivery, but also with regard to our daily business operations and a fair share of value added?  - (FV) To what extent have we established and are maintaining a complaints procedure for our direct suppliers? - How satisfied are our suppliers with regard to pricing and terms of payment and delivery as well as with their share of added value?  - (FV) How do we monitor the effectiveness of our policies and measures regarding fair and just business practices towards our direct suppliers?',
        },
      ],
    });
  });
});
