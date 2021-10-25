

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");

	$("#toMyTeam").click((event) => {
		window.location.href = "./myTeam.html"
	});
	$("#toAddPlayers").click((event) => {
		window.location.href = "./addPlayers.html"
	});

	$("#toSignOut").click((event) => {
		window.location.href = "./login.html"
	});

	$("#toSettings").click(((event) => {
		window.location.href = "./settings.html"
	}))

	$(".details").click((event) => {
		window.location.href = "./details.html"
	});


};

rhit.main();
