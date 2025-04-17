const allProps = JSON.parse(
	await Deno.readTextFile("./jsons/allPropsList.json"),
);

const allCorrectProps = JSON.parse(
	await Deno.readTextFile("./jsons/allProps.json"),
);

const uniqueProps = allProps.filter(function (obj) {
	return allCorrectProps.indexOf(obj.item) == -1;
});

await Deno.writeTextFile(
	"./jsons/allUniqueProps.json",
	JSON.stringify(uniqueProps),
);
