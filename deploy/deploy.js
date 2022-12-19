import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
} from "@stacks/transactions";
import { StacksTestnet, StacksMainnet } from "@stacks/network";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

const network = new StacksTestnet();

const txOptions = {
  contractName: "filechain",
  codeBody: readFileSync("./contracts/filechain.clar").toString(),
  senderKey: privateKey,
  network,
  anchorMode: AnchorMode.Any,
};

const transaction = await makeContractDeploy(txOptions);

const broadcastResponse = await broadcastTransaction(transaction, network);
const txId = broadcastResponse.txid;

console.log(txId);
