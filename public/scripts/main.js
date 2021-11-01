/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
			console.log("clicked rosefire");
		}
	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}
	signIn() {
		Rosefire.signIn("b0c89d07-7235-431c-bd28-6725bd6143ee", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);

			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you provided is not valid.');
				} else {
					console.error("Custom auth error", errorCode, errorMessage);
				}
			});
		});

	}
	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Sign out error");
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.checkForRedirects = function () {
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/index.html";
	}
	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/login.html";
	}
}

rhit.initializePage = function () {
	if (document.querySelector("#loginPage")) {
		new rhit.LoginPageController();
	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");

	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);

		rhit.checkForRedirects();

		rhit.initializePage();
	})

	$("#toMyTeam").click((event) => {
		window.location.href = "./myTeam.html"
	});
	$("#toAddPlayers").click((event) => {
		window.location.href = "./addPlayers.html"
	});

	$("#toSignOut").click((event) => {
		rhit.fbAuthManager.signOut();
		window.location.href = "./login.html"
	});

	$("#toSettings").click(((event) => {
		window.location.href = "./settings.html"
	}))

	$(".details").click((event) => {
		window.location.href = "./details.html"
	})

	rhit.startFirebaseUI();
};

rhit.startFirebaseUI = function () {
	var uiConfig = {
		signInSuccessUrl: '/index.html',
		signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
		],
	};
	const ui = new firebaseui.auth.AuthUI(firebase.auth());
	ui.start('#firebaseui-auth-container', uiConfig);
}

rhit.main();
