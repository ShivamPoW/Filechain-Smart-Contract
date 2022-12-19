const { fetch } = require("cross-fetch");
const {
  makeRandomPrivKey,
  privateKeyToString,
  getAddressFromPrivateKey,
  TransactionVersion,
} = require("@stacks/transactions");
const {
  AccountsApi,
  FaucetsApi,
  Configuration,
} = require("@stacks/blockchain-api-client");

const apiConfig = new Configuration({
  fetchApi: fetch,
  basePath: "https://stacks-node-api.testnet.stacks.co",
});

const accounts = new AccountsApi(apiConfig);

// Get privateKey
const privateKey = makeRandomPrivKey();
const privateKeyString = privateKeyToString(privateKey);

// Get Address
// ST2ZXSPY9SZVNCD238SQH6QYZNJJ7VS06K97184AG
const stacksAddress = getAddressFromPrivateKey(
  privateKeyToString(privateKey),
  TransactionVersion.Testnet
);

// account info
async function getAccountInfoWithoutProof() {
  const accountInfo = await accounts.getAccountInfo({
    principal: stacksAddress,
    proof: 0,
  });

  return accountInfo;
}

// Get some STX tokens
async function runFaucetStx() {
  const faucets = new FaucetsApi(apiConfig);

  const faucetTx = await faucets.runFaucetStx({
    address: stacksAddress,
  });

  return faucetTx;
}

runFaucetStx().then((x) => console.log(x));
console.log(privateKeyString, stacksAddress);
