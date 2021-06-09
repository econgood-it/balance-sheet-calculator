import { EmployeesFractionDTOCreate } from '../../../src/dto/create/employees.fraction.create.dto';

describe('Employees Fraction DTO', () => {
  it('should create DTO and return employees fraction entity', () => {
    const employeesFractionDTOCreate = EmployeesFractionDTOCreate.fromJSON({
      countryCode: 'DEU',
      percentage: 0.9,
    });
    const result = employeesFractionDTOCreate.toEmployeesFraction();
    expect(result.countryCode).toBe('DEU');
    expect(result.percentage).toBe(0.9);
  });

  it('should create DTO using default values', () => {
    const employeesFractionDTOCreate = EmployeesFractionDTOCreate.fromJSON({
      countryCode: 'DEU',
    });
    const result = employeesFractionDTOCreate.toEmployeesFraction();
    expect(result.countryCode).toBe('DEU');
    expect(result.percentage).toBe(0);
  });
});
