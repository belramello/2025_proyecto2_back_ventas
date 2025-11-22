/* eslint-disable @typescript-eslint/unbound-method */
// --- MOCKS ---
// Mock the jsonwebtoken library
const mockJwtSign = jest.fn();
jest.mock('jsonwebtoken', () => ({
  sign: mockJwtSign,
}));

// Mock the strategy classes and their methods
const mockAdminPayload = { resource: { dashboard: 1 }, params: {}, exp: 123 };
const mockVendedorPayload = {
  resource: { dashboard: 2 },
  params: { vendedor_id: 1 },
  exp: 123,
};
const mockDueñoPayload = { resource: { dashboard: 3 }, params: {}, exp: 123 };

// Mock the actual strategy classes (or just their methods if preferred)
jest.mock('./strategies/administrador-strategy', () => ({
  AdministradorStrategy: jest.fn().mockImplementation(() => ({
    generatePayloard: jest.fn().mockReturnValue(mockAdminPayload), // Note the typo in your original code: Payloard -> Payload
  })),
}));
jest.mock('./strategies/vendedor-strategy', () => ({
  VendedorStrategy: jest.fn().mockImplementation(() => ({
    generatePayloard: jest.fn().mockReturnValue(mockVendedorPayload),
  })),
}));
jest.mock('./strategies/dueño-strategy', () => ({
  DueñoStrategy: jest.fn().mockImplementation(() => ({
    DueñoStrategy: jest.fn(), // If the constructor exists
    generatePayloard: jest.fn().mockReturnValue(mockDueñoPayload),
  })),
}));

// --- IMPORTS ---
import { Test, TestingModule } from '@nestjs/testing';
import { MetabaseService } from './metabase.service';
import { RolesEnum } from '../modules/roles/enums/roles-enum'; // Assuming RolesEnum path is correct
import { AdministradorStrategy } from './strategies/administrador-strategy';
import { VendedorStrategy } from './strategies/vendedor-strategy';
import { DueñoStrategy } from './strategies/dueño-strategy';
import * as jwt from 'jsonwebtoken'; // Import the mocked version

// --- TEST SUITE ---
describe('MetabaseService', () => {
  let service: MetabaseService;
  const originalEnv = process.env; // Store original env

  // Define mock env variables
  const mockSecretKey = 'test-secret-key';
  const mockMetabaseUrl = 'http://mock-metabase.com';

  beforeEach(async () => {
    // Set mock env variables for each test
    process.env = {
      ...originalEnv,
      METABASE_SECRET_KEY: mockSecretKey,
      METABASE_URL: mockMetabaseUrl,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [MetabaseService],
    }).compile();

    service = module.get<MetabaseService>(MetabaseService);
  });

  afterEach(() => {
    process.env = originalEnv; // Restore original env
    jest.clearAllMocks(); // Clear all mocks including jwt.sign
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSignedUrl', () => {
    const userId = 1;
    const mockSignedToken = 'signed-jwt-token';

    it('should throw an error if METABASE_SECRET_KEY is not configured', () => {
      delete process.env.METABASE_SECRET_KEY; // Simulate missing key
      // Re-instantiate service with missing key
      const serviceWithoutKey = new MetabaseService();
      expect(() =>
        serviceWithoutKey.generateSignedUrl(userId, RolesEnum.ADMINISTRADOR),
      ).toThrow('Metabase secret key not configured');
    });

    it('should use AdministradorStrategy and generate correct URL for ADMIN role', () => {
      mockJwtSign.mockReturnValue(mockSignedToken);
      const expectedUrl = `${mockMetabaseUrl}/embed/dashboard/${mockSignedToken}#background=false&bordered=false&titled=false`;

      const result = service.generateSignedUrl(userId, RolesEnum.ADMINISTRADOR);

      expect(AdministradorStrategy).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith(mockAdminPayload, mockSecretKey);
      expect(result).toEqual({ signedUrl: expectedUrl });
    });

    it('should use VendedorStrategy and generate correct URL for VENDEDOR role', () => {
      mockJwtSign.mockReturnValue(mockSignedToken);
      const expectedUrl = `${mockMetabaseUrl}/embed/dashboard/${mockSignedToken}#background=false&bordered=false&titled=false`;
      // Ensure the VendedorStrategy mock's generatePayloard is called correctly
      const vendedorInstance = new VendedorStrategy(); // Create instance to access mocked method
      jest.spyOn(vendedorInstance, 'generatePayloard'); // Spy on the method of the instance

      const result = service.generateSignedUrl(userId, RolesEnum.VENDEDOR);

      expect(VendedorStrategy).toHaveBeenCalledTimes(2);
      expect(jwt.sign).toHaveBeenCalledWith(mockVendedorPayload, mockSecretKey);
      expect(result).toEqual({ signedUrl: expectedUrl });
    });

    it('should use DueñoStrategy and generate correct URL for DUEÑO role', () => {
      mockJwtSign.mockReturnValue(mockSignedToken);
      const expectedUrl = `${mockMetabaseUrl}/embed/dashboard/${mockSignedToken}#background=false&bordered=false&titled=false`;

      const result = service.generateSignedUrl(userId, RolesEnum.DUEÑO);

      expect(DueñoStrategy).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith(mockDueñoPayload, mockSecretKey);
      expect(result).toEqual({ signedUrl: expectedUrl });
    });

    it('should throw an error for an invalid role', () => {
      const invalidRoleId = 999;
      expect(() => service.generateSignedUrl(userId, invalidRoleId)).toThrow(
        'No se encontró un rol válido',
      );
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should use default METABASE_URL if env variable is missing', () => {
      delete process.env.METABASE_URL; // Simulate missing URL env
      // Re-instantiate service with missing URL
      const serviceWithoutUrl = new MetabaseService();
      mockJwtSign.mockReturnValue(mockSignedToken);
      const defaultUrl = 'http://localhost:4000'; // Default value in your service
      const expectedUrl = `${defaultUrl}/embed/dashboard/${mockSignedToken}#background=false&bordered=false&titled=false`;

      const result = serviceWithoutUrl.generateSignedUrl(
        userId,
        RolesEnum.ADMINISTRADOR,
      );
      expect(result).toEqual({ signedUrl: expectedUrl });
    });
  });
});
