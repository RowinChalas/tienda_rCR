import { IProductRepository } from '../repositories/interfaces/IProductRepository';
import { ISupplierRepository, IOrderRepository, ICrmRepository, IPricingRepository } from '../repositories/interfaces/IRepositories';
import { MockProductRepository } from '../repositories/mock/MockProductRepository';
import { MockOrderRepository } from '../repositories/mock/MockOrderRepository';
import { MockCrmRepository, MockSupplierRepository, MockPricingRepository } from '../repositories/mock/MockOtherRepositories';

/**
 * Contenedor de Servicios & Inyección de Dependencias (Agnosticismo de Datos)
 * Permite conmutar entre Mock InMemory / Supabase / .NET REST sin tocar la UI.
 */
class ServiceContainer {
  public readonly productRepo: IProductRepository;
  public readonly orderRepo: IOrderRepository;
  public readonly crmRepo: ICrmRepository;
  public readonly supplierRepo: ISupplierRepository;
  public readonly pricingRepo: IPricingRepository;

  constructor() {
    this.productRepo = new MockProductRepository();
    this.orderRepo = new MockOrderRepository();
    this.crmRepo = new MockCrmRepository();
    this.supplierRepo = new MockSupplierRepository();
    this.pricingRepo = new MockPricingRepository();
  }
}

export const services = new ServiceContainer();
