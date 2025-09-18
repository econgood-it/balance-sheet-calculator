import { makeZitadelClient } from '../../src/security/zitadel.client';

import axios from 'axios';
import { z } from 'zod';

// Mock axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Zitadel Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should get user', async function () {
    const mockedUser = {
      user: {
        human: {
          email: {
            email: 'mail@example.com',
          },
          profile: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      },
    };
    const userId = 'user-id';
    const token = 'mocked-token';
    mockedAxios.get.mockResolvedValue({ data: mockedUser });

    const client = makeZitadelClient(token);
    const user = await client.getUser(userId);
    expect(user).toEqual({
      email: 'mail@example.com',
      fullName: 'John Doe',
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://zitadel.dev.econgood.org/management/v1/users/user-id',
      {
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer mocked-token',
        },
      }
    );
  });
});
