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
	if(document.querySelector("#addPlayersPage")){
		rhit.FbAddPlayersManager = new rhit.FbAddPlayersManager();
		new rhit.addPlayersPageController();
	}
	if(document.querySelector("#myTeamPage")){
		console.log(rhit.fbAuthManager.uid);
		//testing
		rhit.FbMyTeamManager = new rhit.FbMyTeamManager(rhit.fbAuthManager.uid);
		
		new rhit.myTeamPageController();
	}


}

rhit.addPlayersPageController = class{
	constructor(){
		console.log("created AddPlayersPageController");


		rhit.FbAddPlayersManager.beginListening(this.updateList.bind(this));
		//rhit.FbMyTeamManager.beginListening(rhit.myTeamPageController.updateList.bind(this));
	}

	_createCard(player){
		console.log('player :>> ', player);
		if(player.name != "hidden"){
			return htmlToElement(`
		<div class="player">
        <div>
          <h1>${player.name}</h1>
          <p>${player.team}</p>
        </div>
        <div>
          <button class="btn btn-raised add">Add</button>
        </div>
      </div>


		`);
		}
		

	}

	updateList(){
		const newList = htmlToElement('<div id="playerListContainer"></div>');
		for (let i = 0; i < rhit.FbAddPlayersManager.length; i++){

			const p = rhit.FbAddPlayersManager.getPlayerAtIndex(i);
			if(p.name != "hidden"){
				const newCard = this._createCard(p);

			
				newCard.querySelector(".add").onclick = (event) => {
					console.log(`you clicked on ${p.name}`);
					rhit.FbAddPlayersManager.addPlayer(p.name);
	

			}

			newList.appendChild(newCard);
			}
			
		}
		const oldList = document.querySelector("#playerListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);


	}
}




rhit.player = class {
	constructor(id, name, team){
		this.id = id;
		this.name = name;
		this.team = team; 
	}
}

rhit.FbAddPlayersManager = class {
	constructor(){
		console.log("created FbAddPlayersManager");
		this._documentSnapshots = [];
		this._documentSnapshot = {};
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PLAYERS);
		this._ref2 = firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(rhit.fbAuthManager.uid);
		this._unsubscribe = null;
		this._unsubscribe2 = null;
		this.team = [];
		
	}

	beginListening(changeListener){
		this._unsubscribe = this._ref
			.onSnapshot((querySnapshot) => {
				this._documentSnapshots = querySnapshot.docs;
				changeListener();
			});
		this._unsubscribe2  =this._ref2
		.onSnapshot((doc) => {
			if(doc.exists){
				console.log("Document data:", doc.data());
				this._documentSnapshot=doc;
				this.team = doc.data().team;
				changeListener();
			}else {
				console.log("No such document!");
			}
		})
	}
	stopListening(){
		this._unsubscribe();
	}
	get length(){
		return this._documentSnapshots.length;
	}


	getPlayerAtIndex(index){
		const docSnapshot = this._documentSnapshots[index];
		console.log(this.team);
		const p = new rhit.player(docSnapshot.id, docSnapshot.get("name"), docSnapshot.get("team"));
		return this.checkIfOnTeam(p);
	}
	addPlayer(player){
		console.log(this._documentSnapshot);
		let team = this._documentSnapshot.data().team;
		if(team.includes(player)){

		}
		else{
			team.push(player)
			this._ref2.set({
			['team']: team
		})
		}
		
		
		
	}

	checkIfOnTeam(player){
		if(! this.team.includes(player.name)){
			return player;
		}else{
			return new rhit.player(0, "hidden", "hidden")
		}
		

	}

}


rhit.myTeamPageController = class{
	constructor() {
		

		setTimeout(rhit.FbMyTeamManager.beginListening(this.updateList.bind(this)), 2000);


	}

	_createCard(player){
		console.log('player :>> ', player);

		return htmlToElement(`
		<div class="row player">
			<div class="col-10">
				<div>
					<h1 style="padding-bottom: 20px">${player}</h1>
					<div>  
						<button class="btn btn-raised drop">drop</button>
					</div>
				</div>
			</div>
			<div class="col-2 my-auto">
				<h1>Score: <span class="score"> 0</span> </h1)
			</div>
		</div>
		`);

	}

	updateList(){
		console.log("list updated");
		const newList = htmlToElement('<div id="playerListContainer"></div>');
		for (let i = 0; i < rhit.FbMyTeamManager.team.length; i++){
			console.log(rhit.FbMyTeamManager.team[i]);
			const p = rhit.FbMyTeamManager.team[i];
			const newCard = this._createCard(p);


			newCard.querySelector(".drop").onclick = (event) => {
				console.log(`you clicked on ${p}`);
				rhit.FbMyTeamManager.dropPlayer(p);

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
	constructor(uid){
		console.log("created FbMyTeamManager");
		this._documentSnapshot = {};
		this._ref = firebase.firestore().collection("Users").doc(rhit.fbAuthManager.uid);
		this.uid = uid;
		this._unsubscribe = null;
		this.team = this.getTeam();
		
	}
	beginListening(changeListener){


		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if(doc.exists){
				console.log("Document data:", doc.data());
				this._documentSnapshot=doc;
				changeListener();
			}else {
				console.log("No such document!");
			}
		});
	}
	stopListening(){
		this._unsubscribe();
	}

	getTeam (){

				this._ref.onSnapshot((doc) => {
					this.team = doc.data().team;
					return this.team
				})
		
	}
	dropPlayer(player){
		this.getTeam();
		let index = this.team.indexOf(player)
		this.team.splice(index,1);
		console.log(this.team);
		this._ref.set({
			['team']: this.team
		})
	}
}


rhit.detailsPageController = class {
	constructor(){

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
