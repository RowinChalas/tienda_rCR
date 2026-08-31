import { IProductRepository } from '../repositories/interfaces/IProductRepository';
import {
  ISupplierRepository,
  IOrderRepository,
  ICrmRepository,
  IPricingRepository,
  ISettingsRepository,
  ICmsRepository,
  ITagRepository,
  ISectionRepository,
} from '../repositories/interfaces/IRepositories';
import { MockProductRepository } from '../repositories/mock/MockProductRepository';
import { MockOrderRepository } from '../repositories/mock/MockOrderRepository';
import { MockCrmRepository, MockSupplierRepository, MockPricingRepository } from '../repositories/mock/MockOtherRepositories';
import { MockSettingsRepository } from '../repositories/mock/MockSettingsRepository';
import { MockCmsRepository } from '../repositories/mock/MockCmsRepository';
import { MockTagRepository } from '../repositories/mock/MockTagRepository';
import { MockSectionRepository } from '../repositories/mock/MockSectionRepository';

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
  public readonly settingsRepo: ISettingsRepository;
  public readonly cmsRepo: ICmsRepository;
  public readonly tagRepo: ITagRepository;
  public readonly sectionRepo: ISectionRepository;

  constructor() {
    this.productRepo = new MockProductRepository();
    this.orderRepo = new MockOrderRepository();
    this.crmRepo = new MockCrmRepository();
    this.supplierRepo = new MockSupplierRepository();
    this.pricingRepo = new MockPricingRepository();
    this.settingsRepo = new MockSettingsRepository();
    this.cmsRepo = new MockCmsRepository();
    this.tagRepo = new MockTagRepository();
    this.sectionRepo = new MockSectionRepository();
  }
}

export const services = new ServiceContainer();
