import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v1.0.6/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";


//testing multiple commit handling and all other utility functions testing

Clarinet.test({
  name: "Ensure that multiple commits are processed correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1");
    let block = chain.mineBlock([
      Tx.contractCall("filechain", "get-last-commit", [], wallet_1.address),
      Tx.contractCall(
        "filechain",
        "add-merkle-root",
        [types.utf8("initial commit"), types.buff("4bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459a"), types.uint(33)],
        wallet_1.address
      ),
      Tx.contractCall(
        "filechain",
        "add-merkle-root",
        [types.utf8("added some files"), types.buff("dbc1b4c900ffe48d575b5da5c638040125f65db0fe3e24494b76ea986457d986"), types.uint(25)],
        wallet_1.address
      ),
      Tx.contractCall(
        "filechain",
        "add-merkle-root",
        [types.utf8("some more files are added"), types.buff("084fed08b978af4d7d196a7446a86b58009e636b611db16211b65a9aadff29c5"), types.uint(100)],
        wallet_1.address
      ),
      Tx.contractCall("filechain", "get-last-commit", [], wallet_1.address),
      Tx.contractCall("filechain", "get-commit-info", [types.uint(1)], wallet_1.address),
      Tx.contractCall("filechain", "get-commit-info", [types.uint(2)], wallet_1.address),
      Tx.contractCall("filechain", "get-commit-info", [types.uint(3)], wallet_1.address),
      Tx.contractCall("filechain", "get-total-files", [types.uint(1)], wallet_1.address),
      Tx.contractCall("filechain", "get-total-files", [types.uint(2)], wallet_1.address),
      Tx.contractCall("filechain", "get-total-files", [types.uint(3)], wallet_1.address),
      Tx.contractCall("filechain", "get-total-commit-files", [types.uint(1)], wallet_1.address),
      Tx.contractCall("filechain", "get-total-commit-files", [types.uint(2)], wallet_1.address),
      Tx.contractCall("filechain", "get-total-commit-files", [types.uint(3)], wallet_1.address),
      Tx.contractCall("filechain", "get-commit-name", [types.uint(2)], wallet_1.address),
      Tx.contractCall("filechain", "get-merkle-root", [types.uint(3)], wallet_1.address),

    ]);

    assertEquals(block.receipts.length, 16);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectUint(0);
    block.receipts[1].result
      .expectOk()
      .expectAscii("commit-added");
    block.receipts[2].result
      .expectOk()
      .expectAscii("commit-added");
    block.receipts[3].result
      .expectOk()
      .expectAscii("commit-added");
    block.receipts[4].result.expectUint(3);
    block.receipts[5].result
      .expectOk()
      .expectSome()
      .expectTuple('{files: u33, merkle_root: 0x34626635313232663334343535346335336264653265626238636432623765336431363030616436333163333835613564376363653233633737383534353961, name: u"initial commit"}');
    block.receipts[6].result
      .expectOk()
      .expectSome()
      .expectTuple('{files: u58, merkle_root: 0x64626331623463393030666665343864353735623564613563363338303430313235663635646230666533653234343934623736656139383634353764393836, name: u"added some files"}');
    block.receipts[7].result
      .expectOk()
      .expectSome()
      .expectTuple('files: u158, merkle_root: 0x30383466656430386239373861663464376431393661373434366138366235383030396536333662363131646231363231316236356139616164666632396335, name: u"some more files are added"}');
    block.receipts[8].result.expectUint(33);
    block.receipts[9].result.expectUint(58);
    block.receipts[10].result.expectUint(158);
    block.receipts[11].result.expectUint(33);
    block.receipts[12].result.expectUint(25);
    block.receipts[13].result.expectUint(100);
    block.receipts[14].result.expectUtf8("added some files");
    block.receipts[15].result.expectBuff("084fed08b978af4d7d196a7446a86b58009e636b611db16211b65a9aadff29c5");

  },
});


//testing that two same commits should not be added consecutively

Clarinet.test({
  name: "Ensure that commit with the same root can't be added",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1");
    let block = chain.mineBlock([
      Tx.contractCall("filechain", "get-last-commit", [], wallet_1.address),
      Tx.contractCall(
        "filechain",
        "add-merkle-root",
        [types.utf8("initial commit"), types.buff("fd0f0bea11e5d781d6f781620aa1e615a1f3c40c718915b9ffc35f5d2e12d7ff"), types.uint(33)],
        wallet_1.address
      ),
      Tx.contractCall(
        "filechain",
        "add-merkle-root",
        [types.utf8("initial commit"), types.buff("fd0f0bea11e5d781d6f781620aa1e615a1f3c40c718915b9ffc35f5d2e12d7ff"), types.uint(33)],
        wallet_1.address
      ),
      Tx.contractCall("filechain", "get-last-commit", [], wallet_1.address),
    ]);
    assertEquals(block.receipts.length, 4);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectUint(0);
    block.receipts[1].result
      .expectOk()
      .expectAscii("commit-added");
    block.receipts[2].result
      .expectErr("ERR_HASH_ALREADY_EXISTS");
    block.receipts[3].result.expectUint(1);
  },
});


//testing add-merkle-root function using other utility functions 

Clarinet.test({
  name: "Ensure that commits are added as intended",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1");
    let block = chain.mineBlock([
      Tx.contractCall("filechain", "get-last-commit", [], wallet_1.address),
      Tx.contractCall(
        "filechain",
        "add-merkle-root",
        [types.utf8("initial commit"), types.buff("fd0f0bea11e5d781d6f781620aa1e615a1f3c40c718915b9ffc35f5d2e12d7ff"), types.uint(33)],
        wallet_1.address
      ),
      Tx.contractCall("filechain", "get-last-commit", [], wallet_1.address),
      Tx.contractCall("filechain", "get-merkle-root", [types.uint(1)], wallet_1.address),
    ]);
    assertEquals(block.receipts.length, 4);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectUint(0);
    block.receipts[1].result
      .expectOk()
      .expectAscii("commit-added");
    block.receipts[2].result.expectUint(1);
    block.receipts[3].result.expectBuff("fd0f0bea11e5d781d6f781620aa1e615a1f3c40c718915b9ffc35f5d2e12d7ff");
  },
});

