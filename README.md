A wrapper api for Aramex tracking and shipping api

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm i aramex-api-services
```

## API

```js
var aramex = require('aramex-api');
```

## Examples

//Change ClientInfo properties if you want to use real account not a test account

clientInfo = new aramex.ClientInfo() ;

let aramex = require('aramex-api');

aramex.Aramex.setClientInfo(clientInfo);

aramex.Aramex.setConsignee(new aramex.Consignee());

aramex.Aramex.setShipper(new aramex.Shipper());

aramex.Aramex.setThirdParty(new aramex.ThirdParty());

aramex.Aramex.setDetails(1);

aramex.Aramex.setDimension();

aramex.Aramex.setWeight();

//Creating shipment

let result = await aramex.Aramex.createShipment([
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
]);

//tracking shipment
let result = await aramex.Aramex.track(['3915342793', '3915342826']);

## License

[MIT](LICENSE)
