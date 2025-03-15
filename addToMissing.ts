// Function to push missing links easily

export const addLink = async (type:string, sheet:string) => {
    console.log(type, sheet)
	const linksThatAreMissing = JSON.parse(
		await Deno.readTextFile("./jsons/missing.json"),
	);
	if (type != null && sheet != null && linksThatAreMissing[type]) {
		linksThatAreMissing[type].push(sheet);

		for (const array in linksThatAreMissing) {
			linksThatAreMissing[array] = [
				...new Set(linksThatAreMissing[array].sort(function(a:string,b:string){
                    return a.localeCompare(b);
                })),
			];
		}

		await Deno.writeTextFile(
			"./jsons/missing.json",
			JSON.stringify(linksThatAreMissing, null, 2),
		);

		console.log(` added ${sheet} to missing ${type} list`);
	} else {
		console.log("added nada");
	}
};

addLink(Deno.args[0],Deno.args[1])