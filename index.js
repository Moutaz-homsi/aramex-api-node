/**
 * Aramex shipping and tracking services
 *
 * Copyright (c) 2018 Baianat.com by Gaber Abdo.
 */

var bodyParser = require('body-parser');
let express = require('express');
let http = require('http');
let soap = require('strong-soap').soap;
let path = require('path');
let moment = require('moment')();

class ClientInfo {
  constructor() {
    // Default api test account
    this.data = {
      UserName: 'testingapi@aramex.com',
      Password: 'R123456789$r',
      Version: 'v1.0',
      AccountNumber: '20016',
      AccountPin: '331421',
      AccountEntity: 'AMM',
      AccountCountryCode: 'JO'
    };
  }
  setUserName(UserName) {
    this.data.UserName = UserName;
    return this;
  }
  setPassword(Password) {
    this.data.Password = Password;
    return this;
  }
  setVersion(Version) {
    this.data.Version = Version;
    return this;
  }
  setAccPin(AccountPin) {
    this.data.AccountPin = AccountPin;
    return this;
  }

  setAccNumber(AccountNumber) {
    this.data.AccountNumber = AccountNumber;
    return this;
  }

  setAccEntity(AccountEntity) {
    this.data.AccountEntity = AccountEntity;
    return this;
  }

  setAccCountryCode(AccountCountryCode) {
    this.data.AccountCountryCode = AccountCountryCode;
    return this;
  }

  get() {
    return this.data;
  }
}

class defaultArgList {
  constructor() {
    this.data = {};
  }
  get() {
    return this.data;
  }
}

class Shipper extends defaultArgList {
  constructor(
    PersonName = 'Baianat',
    CompanyName = 'Baianat',
    EmailAddress = 'info@baianat.com',
    PhoneNumber1 = '01000702222',
    PhoneNumber1Ext = '010',
    CellPhone = '07777777',
    Line1 = 'Helaly st',
    CountryCode = 'Jo',
    City = 'Cairo'
  ) {
    super();
    this.data = {
      Reference1: 'Ref 111111',
      Reference2: 'Ref 222222',
      AccountNumber: '20016',
      PartyAddress: {
        Line1,
        Line2: '',
        Line3: '',
        City,
        StateOrProvinceCode: '',
        PostCode: '',
        CountryCode
      },
      Contact: {
        Department: '',
        PersonName,
        Title: '',
        CompanyName,
        PhoneNumber1,
        PhoneNumber1Ext,
        PhoneNumber2: '',
        PhoneNumber2Ext: '',
        FaxNumber: '',
        CellPhone,
        EmailAddress,
        Type: ''
      }
    };
  }
}

class Consignee extends defaultArgList {
  constructor(
    PersonName = 'Baianat',
    CompanyName = 'Baianat',
    EmailAddress = 'info@baianat.com',
    PhoneNumber1 = '01000702222',
    PhoneNumber1Ext = '010',
    Line1 = '15 ABC St',
    Line2 = '',
    City = 'Dubai',
    StateOrProvinceCode = '',
    PostCode = '',
    CellPhone = '0057849',
    CountryCode = 'AE'
  ) {
    super();
    this.data = {
      Reference1: 'Ref 333333',
      Reference2: 'Ref 444444',
      AccountNumber: '',
      PartyAddress: {
        Line1,
        Line2,
        Line3: '',
        City,
        StateOrProvinceCode,
        PostCode,
        CountryCode
      },
      Contact: {
        Department: '',
        PersonName,
        Title: '',
        CompanyName,
        PhoneNumber1,
        PhoneNumber1Ext,
        PhoneNumber2: '',
        PhoneNumber2Ext: '',
        FaxNumber: '',
        CellPhone,
        EmailAddress,
        Type: ''
      }
    };
  }
}

class ThirdParty extends defaultArgList {
  constructor() {
    super();
    this.data = {
      Reference1: '',
      Reference2: '',
      AccountNumber: '',
      PartyAddress: {
        Line1: '',
        Line2: '',
        Line3: '',
        City: '',
        StateOrProvinceCode: '',
        PostCode: '',
        CountryCode: ''
      },
      Contact: {
        Department: '',
        PersonName: '',
        Title: '',
        CompanyName: '',
        PhoneNumber1: '',
        PhoneNumber1Ext: '',
        PhoneNumber2: '',
        PhoneNumber2Ext: '',
        FaxNumber: '',
        CellPhone: '',
        EmailAddress: '',
        Type: ''
      }
    };
  }
}

class Aramex {
  constructor() {
    this.args = {};
    this.result = {};
    this.envelope = null;
    this.soapHeader = null;
    this.Shipment = { Details: {} };
  }

  getResult() {
    return this.result;
  }

  getEnvelope() {
    return this.envelope;
  }

  getSoapHeader() {
    return this.soapHeader;
  }

  setClientInfo(clientInfo) {
    this.clientInfo = clientInfo;
  }
  async track(shipments, transaction = null) {
    this.normalizeForTrack(shipments, transaction);
    await this.dispatch(
      '/handlers/shipments-tracking-api-wsdl.wsdl',
      'TrackShipments'
    );
    return this.getResult();
  }

  async createShipment(
    items,
    ForeignHAWB,
    PickupLocation = 'Reception',
    Comments = 'Shpt 0001',
    transaction = null
  ) {
    this.normalizeForCreatingShipments(items, ForeignHAWB, transaction);
    await this.dispatch(
      '/handlers/shipping-services-api-wsdl.wsdl',
      'CreateShipments'
    );
    return this.getResult();
  }

  setShipper(Shipper) {
    this.Shipment['Shipper'] = Shipper.get();
  }

  setConsignee(Consignee) {
    this.Shipment['Consignee'] = Consignee.get();
  }

  setThirdParty(ThirdParty) {
    this.Shipment['ThirdParty'] = ThirdParty.get();
  }

  setDimension(length = 10, width = 10, height = 10, unit = 'CM') {
    this.Shipment['Details']['Dimensions'] = {
      Length: length,
      Width: width,
      Height: height,
      Unit: unit
    };
  }

  setWeight(Value = 0.5, Unit = 'Kg') {
    this.Shipment['Details']['ActualWeight'] = {
      Value,
      Unit
    };
  }

  setDetails(
    NumberOfPieces = 1,
    DescriptionOfGoods = 'Clothes',
    GoodsOriginCountry = 'Jo'
  ) {
    this.Shipment['Details'] = {
      Dimensions: this.Shipment['Details']['Dimensions'],
      ActualWeight: this.Shipment['Details']['ActualWeight'],
      ChargeableWeight: this.Shipment['Details']['ActualWeight'],
      ProductGroup: 'EXP',
      ProductType: 'PDX',
      PaymentType: 'P',
      PaymentOptions: '',
      Services: '',
      NumberOfPieces,
      DescriptionOfGoods,
      GoodsOriginCountry,
      CashOnDeliveryAmount: {
        Value: 0,
        CurrencyCode: ''
      },
      InsuranceAmount: {
        Value: 0,
        CurrencyCode: ''
      },
      CollectAmount: {
        Value: 0,
        CurrencyCode: ''
      },
      CashAdditionalAmount: {
        Value: 0,
        CurrencyCode: ''
      },
      CashAdditionalAmountDescription: '',
      CustomsValueAmount: {
        Value: 0,
        CurrencyCode: ''
      },
      Items: [
        {
          PackageType: 'Box',
          Quantity: 2,
          Weight: {
            Value: 0.5,
            Unit: 'Kg'
          },
          Comments: 'Docs',
          Reference: ''
        }
      ]
    };
  }

  normalizeForCreatingShipments(
    items,
    ForeignHAWB,
    PickupLocation = 'Reception',
    Comments = 'Shpt 0001',
    transaction
  ) {
    if (this.clientInfo == null) {
      this.clientInfo = new ClientInfo();
    }
    this.args = {
      ShipmentCreationRequest: {
        ClientInfo: this.clientInfo.get(),
        Shipments: {
          Shipment: {
            Shipper: this.Shipment['Shipper'],
            Consignee: this.Shipment['Consignee'],
            ThirdParty: this.Shipment['ThirdParty'],
            Reference1: 'Shpt 0001',
            Reference2: '',
            Reference3: '',
            ForeignHAWB,
            TransportType: 0,
            ShippingDateTime: moment.format(),
            DueDate: moment.format(),
            PickupLocation,
            PickupGUID: '',
            Comments,
            AccountingInstrcutions: '',
            OperationsInstructions: '',
            Details: this.Shipment['Details']
          }
        }
      }
    };
    if (transaction != null) {
      this.args['ShipmentTrackingRequest']['Transaction'] = transaction;
    }
  }

  normalizeForTrack(shipments, transaction) {
    if (this.clientInfo == null) {
      this.clientInfo = new ClientInfo();
    }
    this.args = {
      ShipmentTrackingRequest: {
        ClientInfo: this.clientInfo.get(),
        Shipments: { ['string']: shipments }
      }
    };
    if (transaction != null) {
      this.args['ShipmentTrackingRequest']['Transaction'] = transaction;
    }
  }

  async dispatch(wsdl, handler) {
    return new Promise((resolve, reject) => {
      soap.createClient(__dirname + wsdl, async (err, client) => {
        try {
          const { result, envelope, soapHeader } = await client[handler](
            this.args
          );
          this.result = result;
          this.envelope = envelope;
          this.soapHeader = soapHeader;
          resolve(this.result);
        } catch (err) {
          console.log(err);
          reject('Error happened connecting to Aramex soap!');
        }
      });
    });
  }
}

module.exports = {
  Aramex: new Aramex(),
  Consignee,
  Shipper,
  ThirdParty,
  ClientInfo
};
