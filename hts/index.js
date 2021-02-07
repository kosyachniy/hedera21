const {
	Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar,
	TransferTransaction, TokenCreateTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();


async function main() {
	// My account

	const treasuryAccountId = process.env.ACCOUNT_ID;
	const treasuryPrivateKey = process.env.PRIVATE_KEY;
	// const adminPrivateKey = await PrivateKey.generate();
	// const treasuryPublicKey = PrivateKey.fromString(treasuryPrivateKey).publicKey.toString();
	const adminPrivateKey = PrivateKey.fromString(treasuryPrivateKey);
	const adminPublicKey = adminPrivateKey.publicKey;

	if (treasuryAccountId == null || treasuryPrivateKey == null ) {
		throw new Error("Environment variables treasuryAccountId and treasuryPrivateKey must be present");
	}

	// Admin key for HTS


	// Make main acc

	const client = Client.forTestnet();
	client.setOperator(treasuryAccountId, treasuryPrivateKey);

	// // Create token

	// const transaction = await new TokenCreateTransaction()
	// .setTokenName("Token name")
	// .setTokenSymbol("HGC")
	// .setTreasuryAccountId(treasuryAccountId)
	// .setInitialSupply(5000)
	// .setAdminKey(adminPublicKey)
	// .freezeWith(client);

	// const preTx = await transaction.sign(adminPrivateKey);
	// const signTx = await preTx.sign(adminPrivateKey);
	// const txResponse = await signTx.execute(client);

	// console.log(txResponse)

	// New acc

	const newAccountPrivateKey = await PrivateKey.generate();
	const newAccountPublicKey = newAccountPrivateKey.publicKey;

	const newAccountTransactionResponse = await new AccountCreateTransaction()
	    .setKey(newAccountPublicKey)
	    .setInitialBalance(Hbar.fromTinybars(1000))
	    .execute(client);

	const getReceipt = await newAccountTransactionResponse.getReceipt(client);
	const newAccountId = getReceipt.accountId;

	console.log(newAccountPrivateKey.toString(), newAccountPublicKey.toString(), newAccountId.toString());

	// // Balance check

	// const accountBalance = await new AccountBalanceQuery()
	//     .setAccountId(newAccountId)
	//     .execute(client);

	// console.log("The new account balance is: " + accountBalance.hbars.toTinybars() + " tinybar.");

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