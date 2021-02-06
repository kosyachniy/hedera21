const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction, TokenCreateTransaction } = require("@hashgraph/sdk");
require("dotenv").config();


// const newAccountId = "0.0.305125"
// const adminPublicKey = "302a300506032b6570032100c07ef92f27e47f4dc2df80ea9696038c8c6210423f78770fe291958b5b58b851";


async function main() {
	// My acc

    const treasuryAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
	const treasuryKey = process.env.MY_PRIVATE_KEY;

    if (treasuryAccountId == null ||
        myPrivateKey == null ) {
        throw new Error("Environment variables treasuryAccountId and myPrivateKey must be present");
    }

	// Admin key for HTS

	const privateKey = await PrivateKey.generate();
	const key = privateKey.toString();
	const adminKey = privateKey.toString();
	// if (adminKey) {

	// }
	const sigKey = PrivateKey.fromString(key);
	const adminPublicKey = sigKey.publicKey;
	// tx.setAdminKey(sigKey.publicKey);

	// Make main acc

    const client = Client.forTestnet();

    client.setOperator(treasuryAccountId, myPrivateKey);

	// Create token

	const transaction = await new TokenCreateTransaction()
	.setTokenName("Your Token Name")
	.setTokenSymbol("HGC")
	.setTreasuryAccountId(treasuryAccountId)
	.setInitialSupply(5000)
	.setAdminKey(adminPublicKey)
	.freezeWith(client);

	console.log(adminKey, transaction);

	// const preTx = await transaction.sign(sigKey); // adminKey
	// const signTx = await preTx.sign(adminPublicKey); // treasuryKey

	// const signTx = await (await transaction.sign(adminKey)).sign(treasuryKey);
	const signTx = await (await transaction.sign(sigKey)).sign(privateKey);
	const txResponse = await signTx.execute(client);

	console.log(txResponse)

	// // New acc

    // const newAccountPrivateKey = await PrivateKey.generate();
    // const newAccountPublicKey = newAccountPrivateKey.publicKey;

    // const newAccountTransactionResponse = await new AccountCreateTransaction()
    //     .setKey(newAccountPublicKey)
    //     .setInitialBalance(Hbar.fromTinybars(1000))
    //     .execute(client);

    // const getReceipt = await newAccountTransactionResponse.getReceipt(client);
    // const newAccountId = getReceipt.accountId;

    // console.log("The new account ID is: " +newAccountId);

	// // Balance check

    // const accountBalance = await new AccountBalanceQuery()
    //     .setAccountId(newAccountId)
    //     .execute(client);

    // console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");

	// // Transfer

    // const transferTransactionResponse = await new TransferTransaction()
    //     .addHbarTransfer(treasuryAccountId, Hbar.fromTinybars(-1000))
    //     .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000))
    //     .execute(client);

    // const transactionReceipt = await transferTransactionResponse.getReceipt(client);
    // console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

    // const getNewBalance = await new AccountBalanceQuery()
    //     .setAccountId(newAccountId)
    //     .execute(client);

    // console.log("The account balance after the transfer is: " +getNewBalance.hbars.toTinybars() +" tinybar.")
}


main();