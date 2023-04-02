import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { z } from 'zod';
import { OrganizationRequestSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';

@Entity()
export class OrganizationEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column('text')
  public readonly street: string;

  @Column('text')
  public readonly houseNumber: string;

  @Column('text')
  public readonly zip: string;

  @Column('text')
  public readonly city: string;

  public constructor(
    id: number | undefined,
    street: string,
    houseNumber: string,
    zip: string,
    city: string
  ) {
    this.id = id;
    this.street = street;
    this.houseNumber = houseNumber;
    this.zip = zip;
    this.city = city;
  }
}

export function createFromOrganizationRequest(
  organizationRequest: z.infer<typeof OrganizationRequestSchema>
): OrganizationEntity {
  return new OrganizationEntity(
    undefined,
    organizationRequest.address.street,
    organizationRequest.address.houseNumber,
    organizationRequest.address.zip,
    organizationRequest.address.city
  );
}
