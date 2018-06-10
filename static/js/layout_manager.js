var in_game = false;

var toggle = function () {
	in_game = !in_game;
	show_home();
}

var show_home = function () {
	if (in_game) {
		document.getElementById("home_button").style.display="none"
		document.getElementById("settings_button").style.display="none"
		document.getElementById("login_button").style.display="none"

	}
	else {
		document.getElementById("home_button").style.display="block"
		document.getElementById("settings_button").style.display="inline-block"
		document.getElementById("login_button").style.display="inline-block"
	}
}