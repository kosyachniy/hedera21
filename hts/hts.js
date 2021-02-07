const { Client, PrivateKey, TokenCreateTransaction } = require("@hashgraph/sdk");
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

	const transactionReceipt = await txResponse.getReceipt(client);
	const res = transactionReceipt.tokenId.toString();

	return res;
}


async function main() {
	const token = await createToken("Token", "TOK");
	console.log(token);
}

main();