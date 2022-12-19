# Filechain:

## Overview

It gives the user the power to save any file's existence proof on-chain, which works as proof of time and ownership. It gives the user the power to save any file's existence proof on-chain, which works as proof of time and ownership.

Link to the project website: https://filechain.vercel.app/generate

## Prerequisites

These are required in order to test your contract on your terminal

### Node environment

To test the contract on your terminal console, you should have [NodeJS](https://nodejs.org/en/download/) installed on your workstation. To install and run the starter project, you need to have at least version `8.12.0`. You can verify your installation by opening up your terminal and run the following command:

```shell

node --version

```

## Should have Clarinet installed

Using your terminal, run the following command to install clarinet:

> **Note**: you can change the v0.27.0 with version that are available in the releases page.

```bash

wget -nv https://github.com/hirosystems/clarinet/releases/download/v0.27.0/clarinet-linux-x64-glibc.tar.gz -O clarinet-linux-x64.tar.g

tar -xf clarinet-linux-x64.tar.gz

chmod +x ./clarinet

mv ./clarinet /usr/local/bin

```

## Run tests

To run the pre-defined tests:

```bash

clarinet test

```

You should see the following response:

```bash

./tests/filechain_test.ts => Ensure that commits are added as intended ... ok (18ms)

./tests/filechain_test.ts => Ensure that commit with the same root can't be added ... ok (22ms)

./tests/filechain_test.ts => Ensure that multiple commits are processed correctly ... ok (62ms)



ok | 3 passed | 0 failed (118ms)

```

Great, all tests are passing! You can also write your own tests.

## Interact with contracts using console

Run the following command:

```bash

clarinet console

```

You can now call any function of the contract using console using the following syntax shown in example:

```console

(contract-call? .filechain get-last-commit)

```

## Contract Address

ST2DRDC3Q8MBBXD5WYD7VB2H6JYJ1T2TV2R03FAN7.filechain
