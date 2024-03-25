import { expect } from '@jest/globals';
import { areFunctionsEqual } from './function.equality';

expect.addEqualityTesters([areFunctionsEqual]);
