const { createToken } = require("./hts.js");

async function main() {
	const token = await createToken("Token", "TOK");
	console.log(token);
}

main();