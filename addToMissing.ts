// Function to push missing links easily

const linksThatAreMissing = JSON.parse(
	await Deno.readTextFile("./jsons/missing.json"),
);
if (Deno.args[0] != null && Deno.args[1] != null) {
	linksThatAreMissing[Deno.args[0]].push(Deno.args[1]);

	for (const array in linksThatAreMissing) {
		linksThatAreMissing[array] = [...new Set(linksThatAreMissing[array])];
	}

	await Deno.writeTextFile(
		"./jsons/missing.json",
		JSON.stringify(linksThatAreMissing, null, 2),
	);

	console.log(` added ${Deno.args[1]} to missing ${Deno.args[0]} list`);
}else{
    console.log('added nada')
}
