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

rhit.FB_COLLECTION_PLAYERS = "Players";
rhit.FB_COLLECTION_USERS = "Users";
rhit.FB_COLLECTION_ADMIN = "Admin";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};


//from video 
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		}
	}
}

rhit.MainPageController = class {
	constructor() {
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(rhit.fbAuthManager.uid);
		this._ref.get().then((doc) => {
			if (doc.exists && doc.data().team) {
				document.querySelector("#numOfPlayers").innerHTML = doc.data().team.length;
			} else if (doc.exists) {
				document.querySelector("#numOfPlayers").innerHTML = 0;
			} else {
				document.querySelector("#numOfPlayers").innerHTML = 0;
				console.log("No such document!");
			}
		});
	}
}

rhit.SettingsPageController = class {
	constructor() {
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(rhit.fbAuthManager.uid);
		this._ref.get().then((doc) => {
			if (doc.exists) {
				if (doc.data().teamName) {
					document.querySelector("#teamName").value = doc.data().teamName;
					// console.log("Document data:", doc.data());
				}
				if (doc.data().displayName) {
					document.querySelector("#name").value = doc.data().displayName;
				}
			} else {
				console.log("No such document!");
			}
		}).catch((error) => {
			console.log("Error getting document:", error);
		});;
		document.querySelector("#teamName").addEventListener("change", () => {
			this._ref.update({
				["teamName"]: document.querySelector("#teamName").value,
			})
				.catch((error) => {
					this._ref.set({
						["teamName"]: document.querySelector("#teamName").value,
					});
					// console.log("used set, think I cleared everything");
				})

		})

		document.querySelector("#name").addEventListener("change", () => {
			this._ref.update({
				["displayName"]: document.querySelector("#name").value,
			})
				.catch((error) => {
					this._ref.set({
						["displayName"]: document.querySelector("#name").value,
					});
				})
		})

		document.querySelector("#name").value = rhit.fbAuthManager.displayName;
		if (!rhit.fbAuthManager.email) {
			document.querySelector("#email").value = rhit.fbAuthManager.uid + '@rose-hulman.edu';
		} else {
			document.querySelector("#email").value = rhit.fbAuthManager.email;
		}

		document.querySelector("#signOutButton").onclick = (event) => {
			rhit.fbAuthManager.signOut();
		}
	}
}

rhit.AdminPageController = class {
	constructor() {
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_ADMIN).doc(rhit.fbAuthManager.uid);
		this._ref.get().then((doc) => {
			if (doc.exists) {
				document.querySelector("#no-access").style.display = "none";
			} else {
				document.querySelector("#access").style.display = "none";
			}
		});
		document.querySelector("#addScoreButton").onclick = (event) => {
			rhit.FbAdminManager.addScore(document.querySelector("#addScorePlayerName").value, document.querySelector("#addScoreScore").value)
			document.querySelector("#addScorePlayerName").value = "";
			document.querySelector("#addScoreScore").value = "";	

			
		}
	}
}


rhit.FbAdminManager = class {
	constructor() {
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PLAYERS);
		this._documentSnapshot = {};
		this.id = "";
	}

	addScore(player, score){
		this._ref.get().then((snapshot) => {
			snapshot.forEach((doc) => {
				if(player === doc.data().name){
					this._documentSnapshot = doc;
					this.id = doc.id;
					firebase.firestore().collection(rhit.FB_COLLECTION_PLAYERS).doc(this.id).update({
						["score"]: score
					})
				}
			})
		})

	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
		this._displayName = null;
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
	get displayName() {
		return this._user.displayName;
	}
	get email() {
		return this._user.email;
	}
}

rhit.checkForRedirects = function () {
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/settings.html";
	}
	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/login.html";
	}
}

rhit.initializePage = function () {
	if (document.querySelector("#loginPage")) {
		new rhit.LoginPageController();
	}
	if (document.querySelector("#addPlayersPage")) {
		rhit.FbAddPlayersManager = new rhit.FbAddPlayersManager();
		new rhit.addPlayersPageController();
	}
	if (document.querySelector("#myTeamPage")) {
		//console.log(rhit.fbAuthManager.uid);
		//testing
		rhit.FbMyTeamManager = new rhit.FbMyTeamManager(rhit.fbAuthManager.uid);
		let myTeamPageController = new rhit.myTeamPageController();
		
	
		
	}
	if (document.querySelector("#settingsPage")) {
		new rhit.SettingsPageController();
	}
	if (document.querySelector("#mainPage")) {
		new rhit.MainPageController();
	}
	if (document.querySelector("#adminPage")) {
		rhit.FbAdminManager = new rhit.FbAdminManager();
		new rhit.AdminPageController();

	}


}

rhit.addPlayersPageController = class {
	constructor() {
		//console.log("created AddPlayersPageController");
		this.teams = [];
		document.querySelector("#playerFilter").addEventListener('change', () => {
			this.updateList();
		});

		rhit.FbAddPlayersManager.beginListening(this.updateList.bind(this));
		//rhit.FbMyTeamManager.beginListening(rhit.myTeamPageController.updateList.bind(this));
	}

	_createCard(player) {
		//console.log('player :>> ', player);
		if (player.name != "hidden") {
			return htmlToElement(`
		<div class="player">
        <div>
          <h1>${player.name}</h1>
          <p id="team">${player.team}</p>
        </div>
        <div>
          <button class="btn btn-raised add">Add</button>
        </div>
      </div>


		`);
		}


	}

	updateList() {
		const newList = htmlToElement('<div id="playerListContainer"></div>');
		for (let i = 0; i < rhit.FbAddPlayersManager.length; i++) {
			const p = rhit.FbAddPlayersManager.getPlayerAtIndex(i);

			if (p.name != "hidden") {
				const newCard = this._createCard(p);
				newCard.querySelector(".add").onclick = (event) => {
					//console.log(`you clicked on ${p.name}`);
					rhit.FbAddPlayersManager.addPlayer(p.name);
				}
				if (document.querySelector("#playerFilter").value == "all") {
					newList.appendChild(newCard);
				} else if (document.querySelector("#playerFilter").value == p.team) {
					newList.appendChild(newCard);
				}

				if (!this.teams.includes(p.team)) {
					this.teams.push(p.team);
					let option = document.createElement("option");
					option.text = p.team;
					option.value = p.team;
					document.querySelector("#playerFilter").add(option);
				}


			}

		}
		const oldList = document.querySelector("#playerListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);


	}
}

rhit.player = class {
	constructor(id, name, team, owners) {
		this.id = id;
		this.name = name;
		this.team = team;
		this.owners = owners;
	}
}

rhit.FbAddPlayersManager = class {
	constructor() {
		//console.log("created FbAddPlayersManager");
		this._documentSnapshots = [];
		this._documentSnapshot = {};
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PLAYERS);
		this._ref2 = firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(rhit.fbAuthManager.uid);
		this._ref2.update({
			["Init"]: null
		}).catch((error) => {
			this._ref2.set({
				["Init"]: null
			});
			console.log(error);
			// console.log("used set, think I cleared everything");
		});
		this._unsubscribe = null;
		this._unsubscribe2 = null;
		this.team = [];

	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref
			.onSnapshot((querySnapshot) => {
				this._documentSnapshots = querySnapshot.docs;
				changeListener();
			});
		this._unsubscribe2 = this._ref2
			.onSnapshot((doc) => {
				if (doc.exists) {
					//console.log("Document data:", doc.data());
					this._documentSnapshot = doc;
					this.team = doc.data().team;
					changeListener();
				} else {
					console.log("No such document!");
				}
			})
	}
	stopListening() {
		this._unsubscribe();
	}
	get length() {
		return this._documentSnapshots.length;
	}


	getPlayerAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		//console.log(this.team);
		const p = new rhit.player(docSnapshot.id, docSnapshot.get("name"), docSnapshot.get("team"), docSnapshot.get("owners"));
		return this.checkIfOnTeam(p);
	}
	addPlayer(player) {
		//console.log(this._documentSnapshot);
		let team = this._documentSnapshot.data().team;

		this._documentSnapshots.forEach((doc) => {
			if(doc.data().name === player){
				let owners = doc.data().owners;
				if(!owners){
					owners = [];
				}
				owners.push(rhit.fbAuthManager.uid);		
				let id = doc.id;
				this._ref.doc(id).update({
					['owners']: owners
				})
			}
			
		})


		// if (team && team.includes(player)) {

		// }
		// else {
		// 	if (!team) {
		// 		team = [];
		// 	}
		// 	if(team.length > 7){
		// 		alert("You already have a full roster\nPlease drop a player before adding any more");
		// 	}
		// 	else{
			
		// 		team.push(player)
		// 		// this._ref2.update({
		// 		// 	['team']: team
		// 		// }).catch((error) => {
		// 		// 	this._ref2.set({
		// 		// 		['team']: team
		// 		// 	})
		// 		// })
		// 	}
		
		// }



	}

	checkIfOnTeam(player) {
		if (!player.owners) {
			return player;
		}


		if (!player.owners.includes(rhit.fbAuthManager.uid)) {
			return player;
		} else {
			return new rhit.player(0, "hidden", "hidden", null)
		}


	}

}


rhit.myTeamPageController = class {
	constructor() {

		//setTimeout(rhit.FbMyTeamManager.beginListening(this.updateList.bind(this)), 2000);

	

		rhit.FbMyTeamManager.beginListening(this.updateList.bind(this));


		rhit.FbMyTeamManager._ref.get().then((doc) => {
			if (doc.exists) {
				if (doc.data().teamName && doc.data().displayName) {
					document.querySelector("#myTeam").innerHTML = doc.data().displayName + "'s " + doc.data().teamName;
				} else if (doc.data().displayName) {
					document.querySelector("#myTeam").innerHTML = doc.data().displayName + "'s Team";
				} else if (doc.data().teamName) {
					document.querySelector("#myTeam").innerHTML = "The " + doc.data().teamName;
					// console.log("Document data:", doc.data());
				}else{
					document.querySelector("#myTeam").innerHTML = rhit.fbAuthManager.uid + "'s Team";
				}

			} else {
				console.log("No such document!");
			}
		}).catch((error) => {
			console.log("Error getting document:", error);
		});;


		// this.event = new Event('getScore');	

		// document.querySelector("#submitTeam").addEventListener('getScore', (event) => {
		// 	let scores = document.querySelectorAll(".score");

		// 	let total = 0;

		// 	scores.forEach((score) => {
		// 			 console.log(score);
		// 		if(score.innerHTML != "undefined"){
		// 			total+=parseInt(score.innerHTML);
		// 		}
				
		// 	})

		// 	document.querySelector("#score").innerHTML = "Total Team Score: " + total;
		// 	}, false) 
	}



	_createCard(player) {
		//console.log('player :>> ', player);



		return htmlToElement(`
		<div class="row player">
			<div class="col-7 col-lg-9">
				<div>
					<h1 style="padding-bottom: 20px">${player.name}</h1>
					<div>  
						<button class="btn btn-raised drop">drop</button>
					</div>
				</div>
			</div>
			<div class="col-5 col-lg-3 my-auto">
				<h1>Score: <span id="${player.name.replace(" ", "-")}" class="score">${player.score}</span> </h1)
			</div>
		</div>
		`);

		

	}

	updateList() {
		//console.log("list updated");
		const newList = htmlToElement('<div id="playerListContainer"></div>');
		const score = document.querySelector("#totalScoreNum");
		score.innerHTML = 0;
		for (let i = 0; i < rhit.FbMyTeamManager.team.length; i++) {
			//console.log(rhit.FbMyTeamManager.team[i]);
			const p = rhit.FbMyTeamManager.team[i];
			//console.log(scoreManager.getScores());
			if (p.score) {
				score.innerHTML = parseInt(score.innerHTML) + parseInt(p.score);
			}
			const newCard = this._createCard(p);

			newCard.querySelector(".drop").onclick = (event) => {

			//console.log(`you clicked on ${p}`);
			rhit.FbMyTeamManager.dropPlayer(p.name);



			}
			newList.appendChild(newCard);
		}
		const oldList = document.querySelector("#playerListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);



	}
		




}

rhit.FbMyTeamManager = class {
	constructor(uid) {
		//console.log("created FbMyTeamManager");
		this._documentSnapshot = {};
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection("Users").doc(rhit.fbAuthManager.uid);
		 this._ref2 = firebase.firestore().collection("Players");
		 this._ref.update({
			["Init"]: null
		}).catch((error) => {
			this._ref.set({
				["Init"]: null
			});
			console.log(error);
		})
		this.uid = uid;
		this._unsubscribe = null;
		this.team = [];
		this.scores= [];
		this.total = 0;

		


	}
	beginListening(changeListener) {


		// this._unsubscribe = this._ref.onSnapshot((doc) => {
		// 	if (doc.exists) {
		// 		//console.log("Document data:", doc.data());
		// 		this._documentSnapshot = doc;
				
		// 		changeListener();
		// 	} else {
		// 		console.log("No such document!");
		// 	}
		// });


		this._unsubscribe = this._ref2.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			this.getTeam();
			changeListener();
		})
	}
	stopListening() {
		this._unsubscribe();
	}

	getTeam() {
		// this._ref.onSnapshot((doc) => {
		// 	this.team = doc.data().team;
		// 	// doc.data().team.forEach((player) => {
		// 	// 	console.log(this.getScores(player));
		// 	// 	this.scores.push(this.getScores(player));
		// 	// })

		// 	//this.scores.push(this.getScores(this.team[0]));
	
			
		// 	this.scorePush(doc.data().team,0);
			
			

		// 	//return this.team
		// })
		this.team = [];	
		this._documentSnapshots.forEach((doc) => {
			//console.log(doc.data().owners);
			

			if(doc.data().owners && doc.data().owners.includes(rhit.fbAuthManager.uid) && !this.team.includes({'name': doc.data().name, 'score': doc.data().score})){
				if(doc.data().score === undefined){
					this.team.push({
						'name': doc.data().name,
						'score': 0
					})
				}
				else{
					this.team.push({
						'name': doc.data().name,
						'score': doc.data().score
					})
				}
				
				//console.log(this.team);
			}
		})

	}


	// scorePush(team, i) {
	// 	//console.log(team.length);
	// 	//console.log(i);
		
	// 	if(i >= team.length){

	// 	}
	// 	else {
	// 		this.scores.push(this.getScores(this.team[i]));
	// 		setTimeout(() => {
	// 			return this.scorePush(team, i + 1);
	// 		})


	// 	}

	// }

	// getScores(player) {	
	// 	this._ref2.get().then((snapshot) => {
	// 		snapshot.forEach((doc) => {
	// 			if (player == doc.data().name) {
	// 				//console.log(doc.data());
	// 				//console.log(doc.data().score);

	// 				document.querySelector(`#${player.replace(" ", "-")}`).innerHTML = doc.data().score;

	// 				console.log(document.querySelector(`#${player.replace(" ", "-")}`).innerHTML);
	// 				if(doc.data().score != undefined){
	// 					this.total+= parseInt(doc.data().score);
	// 					console.log(this.total);
	// 					document.querySelector("#score").innerHTML = "Total Team Score: " + this.total;
	// 				}
					
	// 				//this.total = 0;
	// 				return {"name": player, "score": doc.data().score};	

	// 			}
	// 		})
	// 	})

	// }



	dropPlayer(player) {
		//this.getTeam();
		this.total = 0;
		//console.log(this.team);
		// this._ref.update({
		// 	['team']: this.team
		// }).catch((error) => {
		// 	this._ref.set({
		// 		['team']: this.team
		// 	})
		// })

		this._documentSnapshots.forEach((doc) => {
			if(doc.data().name == player){
				let index = doc.data().owners.indexOf(player)
				let owners = doc.data().owners;
				owners.splice(index,1);
				this.team.splice(this.team.indexOf({'name':player, 'score': doc.data().score}));
				this._ref2.doc(doc.id).update({
					['owners']: owners
				})
			}
		})
	}


}


// rhit.FbScoreManager = class {
// 	constructor(player){
// 		this._documentSnapshots= [];
// 		this._ref = firebase.firestore().collection("Players");
// 		this.score = 0
// 		this.player= player;
// 	}
// 	get Scores(){
// 		this._ref.get().then((snapshot) => {
// 			snapshot.forEach((doc) => {
// 				if(this.player == doc.data().name){
// 					console.log(doc.data());
// 					console.log(doc.data().score);
// 					return doc.data().score;	
// 				}
// 			})
// 		})

// 	}
// }


rhit.detailsPageController = class {
	constructor() {

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

	$("#toAdmin").click((event) => {
		window.location.href = "./admin.html"
	})

	rhit.startFirebaseUI();
};

rhit.startFirebaseUI = function () {
	var uiConfig = {
		signInSuccessUrl: '/settings.html',
		signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
		],
	};
	const ui = new firebaseui.auth.AuthUI(firebase.auth());
	ui.start('#firebaseui-auth-container', uiConfig);
}

rhit.main();
