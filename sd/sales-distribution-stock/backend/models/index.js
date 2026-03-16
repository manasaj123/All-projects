const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql', // or 'postgres'
    logging: false
  }
);

const db = {};
db.sequelize = sequelize;

// Material
db.Material = sequelize.define(
  'Material',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    materialCode: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255), allowNull: false },
    baseUom: { type: DataTypes.STRING(10), allowNull: false },
    materialType: { type: DataTypes.STRING(20), allowNull: false },
    industrySector: { type: DataTypes.STRING(20), allowNull: false },
    documentDate: { type: DataTypes.DATEONLY },
    plant: { type: DataTypes.STRING(10) },
    storageLocation: { type: DataTypes.STRING(10) },
    movementType: { type: DataTypes.STRING(4) },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'materials', timestamps: true }
);

// Sales View for Material
db.SalesView = sequelize.define(
  'SalesView',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // FK to Material
    materialId: { type: DataTypes.INTEGER, allowNull: false },
    salesOrg: { type: DataTypes.STRING(10), allowNull: false },
    distributionChannel: { type: DataTypes.STRING(10), allowNull: false },
    division: { type: DataTypes.STRING(10), allowNull: false },
    deliveringPlant: { type: DataTypes.STRING(10), allowNull: false },
    itemCategoryGroup: { type: DataTypes.STRING(10), allowNull: false },
    loadingGroup: { type: DataTypes.STRING(10) },
    accountAssignmentGroup: { type: DataTypes.STRING(10) },
    priceGroup: { type: DataTypes.STRING(10) },
    priceList: { type: DataTypes.STRING(10) },
    availabilityCheck: { type: DataTypes.STRING(10) },
    transportationGroup: { type: DataTypes.STRING(10) },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'sales_views', timestamps: true }
);

// Customer Account Group
db.CustomerGroup = sequelize.define(
  'CustomerGroup',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    accountGroup: { type: DataTypes.STRING(4), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    fieldStatusGeneral: { type: DataTypes.STRING(20), defaultValue: 'optional' },
    fieldStatusCompanyCode: { type: DataTypes.STRING(20), defaultValue: 'optional' },
    fieldStatusSales: { type: DataTypes.STRING(20), defaultValue: 'optional' },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'customer_groups', timestamps: true }
);

// Customer
db.Customer = sequelize.define(
  'Customer',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customerCode: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    accountGroup: { type: DataTypes.STRING(4), allowNull: false },
    city: { type: DataTypes.STRING(100) },
    country: { type: DataTypes.STRING(3) },
    email: { type: DataTypes.STRING(120) },
    phone: { type: DataTypes.STRING(30) },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'customers', timestamps: true }
);

// Inquiry
db.Inquiry = sequelize.define(
  'Inquiry',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    inquiryType: { type: DataTypes.STRING(4), defaultValue: 'IN' },
    salesOrg: { type: DataTypes.STRING(10), allowNull: false },
    distributionChannel: { type: DataTypes.STRING(10), allowNull: false },
    division: { type: DataTypes.STRING(10), allowNull: false },
    soldToPartyId: { type: DataTypes.INTEGER, allowNull: false },
    shipToPartyId: { type: DataTypes.INTEGER, allowNull: false },
    // for simplicity store items JSON (you can normalize later)
    itemsJson: { type: DataTypes.TEXT }, // JSON string of items
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'inquiries', timestamps: true }
);

// Quotation
db.Quotation = sequelize.define(
  'Quotation',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quotationType: { type: DataTypes.STRING(4), allowNull: false },
    salesOrg: { type: DataTypes.STRING(10), allowNull: false },
    distributionChannel: { type: DataTypes.STRING(10), allowNull: false },
    division: { type: DataTypes.STRING(10), allowNull: false },
    salesOffice: { type: DataTypes.STRING(10) },
    salesGroup: { type: DataTypes.STRING(10) },
    partnerFunction: { type: DataTypes.STRING(4) },
    soldToPartyId: { type: DataTypes.INTEGER, allowNull: false },
    shipToPartyId: { type: DataTypes.INTEGER, allowNull: false },
    purchaseOrderNumber: { type: DataTypes.STRING(30) },
    validFrom: { type: DataTypes.DATEONLY },
    validTo: { type: DataTypes.DATEONLY },
    itemsJson: { type: DataTypes.TEXT }, // items as JSON (material, qty, price)
    referenceInquiryId: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'quotations', timestamps: true }
);

// Sales Order
db.SalesOrder = sequelize.define(
  'SalesOrder',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderType: { type: DataTypes.STRING(4), allowNull: false },
    salesOrg: { type: DataTypes.STRING(10), allowNull: false },
    distributionChannel: { type: DataTypes.STRING(10), allowNull: false },
    division: { type: DataTypes.STRING(10), allowNull: false },
    referenceInquiryId: { type: DataTypes.INTEGER },
    referenceQuotationId: { type: DataTypes.INTEGER },
    soldToPartyId: { type: DataTypes.INTEGER, allowNull: false },
    shipToPartyId: { type: DataTypes.INTEGER, allowNull: false },
    itemsJson: { type: DataTypes.TEXT },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'sales_orders', timestamps: true }
);

// Sales Document Config
db.SalesDocumentConfig = sequelize.define(
  'SalesDocumentConfig',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    documentType: { type: DataTypes.STRING(4), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(100), allowNull: false },
    // general control
    referenceMandatory: { type: DataTypes.BOOLEAN, defaultValue: false },
    checkDivision: { type: DataTypes.BOOLEAN, defaultValue: false },
    probability: { type: DataTypes.INTEGER, defaultValue: 100 },
    checkCreditLimit: { type: DataTypes.BOOLEAN, defaultValue: false },
    creditGroup: { type: DataTypes.STRING(4) },
    // transaction flow
    screenSequence: { type: DataTypes.STRING(10) },
    incompletionProcedure: { type: DataTypes.STRING(10) },
    transactionGroup: { type: DataTypes.STRING(10) },
    docPricingProcedure: { type: DataTypes.STRING(10) },
    // shipping
    deliveryType: { type: DataTypes.STRING(4) },
    deliveryBlock: { type: DataTypes.STRING(4) },
    shippingConditions: { type: DataTypes.STRING(4) },
    shipCostInfoProfile: { type: DataTypes.STRING(10) },
    // billing
    delvBillingType: { type: DataTypes.STRING(4) },
    orderRelBillingType: { type: DataTypes.STRING(4) },
    intercompanyBillingType: { type: DataTypes.STRING(4) },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'sales_document_configs', timestamps: true }
);

// Item Categories Config (mapping)
db.ItemCategoriesConfig = sequelize.define(
  'ItemCategoriesConfig',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    configName: { type: DataTypes.STRING(100), allowNull: false },
    salesDocumentType: { type: DataTypes.STRING(4), allowNull: false },
    itemCategoryGroup: { type: DataTypes.STRING(10), allowNull: false },
    defaultItemCategory: { type: DataTypes.STRING(4), allowNull: false },
    manualItemCategory: { type: DataTypes.STRING(4) },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'item_categories_configs', timestamps: true }
);

// Schedule Line Category
db.ScheduleLine = sequelize.define(
  'ScheduleLine',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    scheduleLineCategory: { type: DataTypes.STRING(3), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(100) },
    deliveryBlock: { type: DataTypes.STRING(4) },
    movementType: { type: DataTypes.STRING(4) },
    orderType: { type: DataTypes.STRING(4) },
    itemCategory: { type: DataTypes.STRING(4) },
    updateScheduleLines: { type: DataTypes.BOOLEAN, defaultValue: true },
    mvtIssValSlt: { type: DataTypes.STRING(4) },
    specIssValSlt: { type: DataTypes.STRING(4) },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'schedule_lines', timestamps: true }
);

// Condition Record
db.Condition = sequelize.define(
  'Condition',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    conditionType: { type: DataTypes.STRING(4), allowNull: false }, // PR00 etc
    customerId: { type: DataTypes.INTEGER },
    materialId: { type: DataTypes.INTEGER },
    salesOrg: { type: DataTypes.STRING(10) },
    distributionChannel: { type: DataTypes.STRING(10) },
    price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), defaultValue: 'INR' },
    validFrom: { type: DataTypes.DATEONLY },
    validTo: { type: DataTypes.DATEONLY },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'conditions', timestamps: true }
);

// Agreement
db.Agreement = sequelize.define(
  'Agreement',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    vendorName: { type: DataTypes.STRING(150), allowNull: false },
    contractType: { type: DataTypes.STRING(4), allowNull: false },
    purchasingOrg: { type: DataTypes.STRING(10), allowNull: false },
    purchasingGroup: { type: DataTypes.STRING(10), allowNull: false },
    plant: { type: DataTypes.STRING(10), allowNull: false },
    agreementDate: { type: DataTypes.DATEONLY, allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'agreements', timestamps: true }
);

// Quota
db.Quota = sequelize.define(
  'Quota',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    purchasingGroup: { type: DataTypes.STRING(10), allowNull: false },
    plant: { type: DataTypes.STRING(10), allowNull: false },
    plantSpecialMaterialStatus: { type: DataTypes.STRING(4) },
    taxIndicatorForMaterial: { type: DataTypes.STRING(4) },
    materialFreightGroup: { type: DataTypes.STRING(10) },
    materialGroup: { type: DataTypes.STRING(10) },
    validFrom: { type: DataTypes.DATEONLY },
    validTo: { type: DataTypes.DATEONLY },
    quotaUsage: { type: DataTypes.STRING(4) },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'quotas', timestamps: true }
);

// Shipping
db.Shipping = sequelize.define(
  'Shipping',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    shippingPoint: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(100) },
    defaultRoute: { type: DataTypes.STRING(10) },
    planningRelevant: { type: DataTypes.BOOLEAN, defaultValue: true },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'shipping', timestamps: true }
);

// Route
db.Route = sequelize.define(
  'Route',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    routeCode: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(100) },
    stagesJson: { type: DataTypes.TEXT }, // JSON array of stages
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'routes', timestamps: true }
);

// Sales Order Delivery
db.Delivery = sequelize.define(
  'Delivery',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    shippingPoint: { type: DataTypes.STRING(10), allowNull: false },
    salesOrderId: { type: DataTypes.INTEGER, allowNull: false },
    itemsJson: { type: DataTypes.TEXT },
    warehouse: { type: DataTypes.STRING(10) },
    plant: { type: DataTypes.STRING(10) },
    deliveryGroup: { type: DataTypes.STRING(10) },
    postGoodsIssueDate: { type: DataTypes.DATEONLY },
    status: {
      type: DataTypes.ENUM('OPEN', 'PICKED', 'PACKED', 'PGI_DONE'),
      defaultValue: 'OPEN'
    },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'deliveries', timestamps: true }
);

// Picking
db.Picking = sequelize.define(
  'Picking',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    deliveryId: { type: DataTypes.INTEGER, allowNull: false },
    warehouse: { type: DataTypes.STRING(10) },
    plant: { type: DataTypes.STRING(10) },
    pickingStatus: { type: DataTypes.ENUM('OPEN', 'PICKED'), defaultValue: 'OPEN' },
    packingStatus: { type: DataTypes.ENUM('OPEN', 'PACKED'), defaultValue: 'OPEN' },
    postGoodsIssue: { type: DataTypes.BOOLEAN, defaultValue: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'pickings', timestamps: true }
);

// Billing
db.Billing = sequelize.define(
  'Billing',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    billingType: { type: DataTypes.STRING(4), allowNull: false },
    billingDate: { type: DataTypes.DATEONLY, allowNull: false },
    referenceDeliveryId: { type: DataTypes.INTEGER, allowNull: false },
    documentNumber: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    totalAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), defaultValue: 'INR' },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'billings', timestamps: true }
);

// Credit
db.Credit = sequelize.define(
  'Credit',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    creditLimit: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), defaultValue: 'INR' },
    riskCategory: { type: DataTypes.STRING(4) },
    creditGroup: { type: DataTypes.STRING(4) },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'credits', timestamps: true }
);

// Pricing Config
db.PricingConfig = sequelize.define(
  'PricingConfig',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pricingProcedure: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(100) },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: 'pricing_configs', timestamps: true }
);

// Simple associations
db.Material.hasMany(db.SalesView, { foreignKey: 'materialId' });
db.SalesView.belongsTo(db.Material, { foreignKey: 'materialId' });

db.Customer.hasMany(db.Inquiry, { foreignKey: 'soldToPartyId', as: 'soldInquiries' });
db.Customer.hasMany(db.Inquiry, { foreignKey: 'shipToPartyId', as: 'shipInquiries' });
db.Inquiry.belongsTo(db.Customer, { foreignKey: 'soldToPartyId', as: 'soldToParty' });
db.Inquiry.belongsTo(db.Customer, { foreignKey: 'shipToPartyId', as: 'shipToParty' });

db.Customer.hasMany(db.Quotation, { foreignKey: 'soldToPartyId', as: 'soldQuotations' });
db.Customer.hasMany(db.Quotation, { foreignKey: 'shipToPartyId', as: 'shipQuotations' });
db.Quotation.belongsTo(db.Customer, { foreignKey: 'soldToPartyId', as: 'soldToParty' });
db.Quotation.belongsTo(db.Customer, { foreignKey: 'shipToPartyId', as: 'shipToParty' });
db.Quotation.belongsTo(db.Inquiry, { foreignKey: 'referenceInquiryId', as: 'referenceInquiry' });

db.Customer.hasMany(db.SalesOrder, { foreignKey: 'soldToPartyId', as: 'soldOrders' });
db.Customer.hasMany(db.SalesOrder, { foreignKey: 'shipToPartyId', as: 'shipOrders' });
db.SalesOrder.belongsTo(db.Customer, { foreignKey: 'soldToPartyId', as: 'soldToParty' });
db.SalesOrder.belongsTo(db.Customer, { foreignKey: 'shipToPartyId', as: 'shipToParty' });
db.SalesOrder.belongsTo(db.Inquiry, { foreignKey: 'referenceInquiryId', as: 'referenceInquiry' });
db.SalesOrder.belongsTo(db.Quotation, { foreignKey: 'referenceQuotationId', as: 'referenceQuotation' });

db.SalesOrder.hasMany(db.Delivery, { foreignKey: 'salesOrderId' });
db.Delivery.belongsTo(db.SalesOrder, { foreignKey: 'salesOrderId' });

db.Delivery.hasOne(db.Picking, { foreignKey: 'deliveryId' });
db.Picking.belongsTo(db.Delivery, { foreignKey: 'deliveryId' });

db.Delivery.hasMany(db.Billing, { foreignKey: 'referenceDeliveryId' });
db.Billing.belongsTo(db.Delivery, { foreignKey: 'referenceDeliveryId' });

db.Customer.hasMany(db.Credit, { foreignKey: 'customerId' });
db.Credit.belongsTo(db.Customer, { foreignKey: 'customerId' });

db.Customer.hasMany(db.Condition, { foreignKey: 'customerId' });
db.Condition.belongsTo(db.Customer, { foreignKey: 'customerId', as: 'customer' });

db.Material.hasMany(db.Condition, { foreignKey: 'materialId' });
db.Condition.belongsTo(db.Material, { foreignKey: 'materialId', as: 'material' });

module.exports = db;
