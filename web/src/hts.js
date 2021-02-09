const {
    Client,
    PrivateKey,
    TokenCreateTransaction,
    AccountBalanceQuery,
    TransferTransaction,
    TokenAssociateTransaction,
    Hbar,
} = require("@hashgraph/sdk");
require("dotenv").config();


const treasuryAccountId = process.env.ACCOUNT_ID;
const treasuryPrivateKey = process.env.PRIVATE_KEY;
const adminPrivateKey = PrivateKey.fromString(treasuryPrivateKey);
const adminPublicKey = adminPrivateKey.publicKey;


const client = Client.forTestnet();
client.setOperator(treasuryAccountId, treasuryPrivateKey);


async function createToken(name, symbol) {
    const transaction = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTreasuryAccountId(treasuryAccountId)
        .setInitialSupply(5000)
        .setAdminKey(adminPublicKey)
        .freezeWith(client);

    const preTx = await transaction.sign(adminPrivateKey);
    const signTx = await preTx.sign(adminPrivateKey);
    const txResponse = await signTx.execute(client);
    const txReceipt = await txResponse.getReceipt(client);

    return txReceipt.tokenId.toString();
}

async function buyToken(tokenId, count, accountId, accountKey) {
    // Associate

    try {
        const transaction_ass = await new TokenAssociateTransaction()
            .setAccountId(accountId)
            .setTokenIds([tokenId])
            .freezeWith(client);

        const signTx_ass = await transaction_ass.sign(PrivateKey.fromString(accountKey));
        const txResponse_ass = await signTx_ass.execute(client);

        // const txReceipt_ass = await txResponse_ass.getReceipt(client);
        // console.log(txReceipt_ass.status);
    } catch {
        // console.log('already');
    }

    // Transfer

    const transaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, treasuryAccountId, -count)
        .addTokenTransfer(tokenId, accountId, count)
        .freezeWith(client);

    const signTx = await transaction.sign(adminPrivateKey);
    const txResponse = await signTx.execute(client);

    return txResponse.transactionId.toString();
}

async function burnToken(tokenId, count, accountId, accountKey) {
    // Transfer

    try {
        const transaction = await new TransferTransaction()
            .addTokenTransfer(tokenId, accountId, -count)
            .addTokenTransfer(tokenId, treasuryAccountId, count)
            .freezeWith(client);

        const signTx = await transaction.sign(PrivateKey.fromString(accountKey));
        const txResponse = await signTx.execute(client);

        return txResponse.transactionId.toString();
    } catch {
        return;
    }
}

async function getBalance(accountId) {
    const query = new AccountBalanceQuery().setAccountId(accountId);
    const tokenBalance = await query.execute(client);
    return tokenBalance.tokens.toString();
}

async function transfer(fromId, toId, fromKey) {
    const transferTransactionResponse = await new TransferTransaction()
        .addHbarTransfer(fromId, Hbar.fromTinybars(-5000))
        .addHbarTransfer(toId, Hbar.fromTinybars(5000))
        .execute(client);

    // const transactionReceipt = await transferTransactionResponse.getReceipt(client);
    // console.log(transactionReceipt.status.toString());

    const getNewBalance = await new AccountBalanceQuery()
        .setAccountId(toId)
        .execute(client);

    return getNewBalance.hbars.toTinybars().toString();
}
