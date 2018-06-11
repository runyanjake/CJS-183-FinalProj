// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    $(window).unload(function(){
    	if (self.vue.is_in_game) {
    		self.leave_game(self.vue.current_gamestate.gametype);
            toggle();
    	}
    });

    $(window).blur(function() {
        console.log("JS: Focus was lost, attempting to leave any ongoing game.");
        //Called when user leaves the window and it loses focus
        self.vue.window_has_focus = false; //causes active vue loop to be stopped
        self.vue.left_game_code = self.vue.current_gamestate.room_code;
        self.vue.left_game_type = self.vue.current_gamestate.gametype;
        self.leave_game(self.vue.current_gamestate.gametype); //TALLTALES ONLY RN


        //^This doesn't work, person isn't actually removed


    });
    $(window).focus(function() {
        console.log("JS: Focus was regained, attempting to join a saved state if one exists.");
        //Called when user comes back to the window and it regains focus
        if(self.vue.left_game_code != null && self.vue.left_game_type != null){
            self.vue.window_has_focus = true;
            self.join_by_code(self.vue.left_game_type, self.vue.left_game_code);
            self.vue.left_game_code = null;
            self.vue.left_game_type = null;
        }
    });

    $(window).load(function(){
        $('.vue-content').hide();
        $('.vue-loadingicon').show();
        self.is_user_in_user_accounts();
        self.get_nickname();
        self.get_theme();
        setTimeout(function () {
            change_background();
            $('.vue-loadingicon').hide();
            $('.vue-content').show(); 
        }, 500);  
    });

    self.show_nickname_editor = function () {
        console.log("Called show_nickname_editor.");
        self.vue.chosen_nickname = false;
        self.vue.chosen_theme = true;
    };

    self.show_theme_editor = function () {
        console.log("Called show_theme_editor.");
        self.vue.chosen_theme = false;
        self.vue.chosen_nickname = true;
    };

    self.get_nickname = function () {
        $.getJSON(get_nickname_url,
            function (data) {
                if (data.successful && data.nickname_logged_in) {
                    console.log("Got nickname: " + data.current_user);
                    self.vue.nickname = data.current_user;
                } 
                else {
                    console.log("Returned unsuccessfully from the API:get_nickname");
                }
            });
    }

    self.get_theme = function () {
        console.log("Getting theme");
        $.getJSON(get_theme_url,
            function (data) {
                console.log("GOT THEME :" + data.theme);
                self.vue.theme = data.theme;
                console.log("self.vue.theme :" + self.vue.theme);
            });
    };

    //load background so it stays for each page
    change_background = function () {
        console.log("Change background called, self.vue.theme: " + self.vue.theme);
        if (self.vue.theme == 1) {
            document.body.style.background = "#74d300";
        }
        else if (self.vue.theme == 2) {
            document.body.style.background = "#2dd8bf";
        }
        else if (self.vue.theme == 3) {
            document.body.style.background = "#ff91ca";
        }
        else if (self.vue.theme == 4) {
            document.body.style.background = "#ffb30f";
        }
        else if (self.vue.theme == 5) {
            document.body.style.background = "#b67fff";
        }
        else {
            document.body.style.backgroundColor =  "#b67fff";
        }
    };

    //Toggle themes
    self.switch_theme = function (theme_code) {
        // Green is 1
        // Turquise is 2
        // Pink is 3
        // Orange is 4
        // Purple is 5
        self.vue.theme = theme_code;
        console.log("Switched theme to: " + self.vue.theme)
        self.set_theme(self.vue.theme);
        // sessionStorage.setItem('theme', self.vue.theme);
        change_background();
        self.vue.chosen_theme = true;
    };

    self.set_theme = function (theme) {
        console.log("Setting theme.");
        $.post(set_theme_url,
            {
                theme: self.vue.theme
            },
            function (data) {
                console.log("JS: Saved theme in database.")
            });
    };

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    /* initialize():
    ----------------------------------------------------------------------------
    Creates a public or private instance of a game (based on gametype) in the database.
    Currently, max_players and turn_time_limit are defaulted but in the future we 
    probably want users to be able to select those values themselves.
    ---------------------------------------------------------------------------- */
    self.initialize = function (gametype) {
        console.log("JS: Creating game instance.");

        $.post(initialize_game_url,
            {	
            	gametype: gametype,
                max_players: 15,
                turn_time_limit: 30,
                is_public: self.vue.is_public,
                story_title: self.vue.story_title
            },
            function(data) {
                if (data.successful == true) {
                    console.log("JS: Returned successfully from API call.");
                    self.vue.current_gamestate = data.gamestate;
                    console.log("self.vue.current_gamestate is " + data.gamestate);
                    //Update in lobby state, which updates HTML
                    self.vue.is_in_game = true;
                    self.vue.show_room_code = false;
                    self.vue_loop(gametype);
                    //Boinkers
                    //clear the title text
                    self.vue.story_title = "";
                }
                else {
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            });
        
    };

    /* is_user_in_user_accounts():
    ----------------------------------------------------------------------------
    Checks if logged-in user is in user_accounts table in database.
    ----------------------------------------------------------------------------*/
    self.is_user_in_user_accounts = function () {
        $.getJSON(check_user_accounts_url,
            function (data) {
                if (data.is_in_table) {
                    self.vue.chosen_nickname = true;
                }
                return data.is_in_table;
            });
    };

    /* set_nickname():
    ----------------------------------------------------------------------------
    Sets logged-in user's nickname in database (accessed from profile tab).
    ----------------------------------------------------------------------------*/
    self.set_nickname = function () {
        console.log("JS: Setting nickname.");
        $.post(set_nickname_url,
            {
                nickname: self.vue.nickname
            },
            function (data) {
                self.vue.nickname = data.nickname
            });
    };

    /* update_current_user():
    ----------------------------------------------------------------------------
    Sets logged-in user's nickname (after adding them to 
    the user_accounts table if necessary).
    ----------------------------------------------------------------------------*/
    self.update_current_user = function () {
        console.log("JS: Adding current user.");
        $.post(update_current_user_url,
            {
                nickname: self.vue.nickname
            },
            function (data) {
                self.vue.chosen_nickname = true;
            });
    };

    /* join_by_stored_code():
    ----------------------------------------------------------------------------
    User can join a private game by entering a room code (presumably shared with them by a friend).
    Room codes are set via v-model to self.vue.join_room_code
    Adds that user to the player_list for the game associated with that room code
    ----------------------------------------------------------------------------*/
    self.join_by_stored_code = function (gametype) {
        self.vue.join_by_code(gametype, self.vue.join_room_code);
        //self.vue.join_room_code = "";
    };

    /* join_by_code():
    ----------------------------------------------------------------------------
    User can join a public game by passing the public game's room code.
    Adds that user to the player_list for the game associated with that room code
    ----------------------------------------------------------------------------*/
    self.join_by_code = function (gametype, room_code) {
        console.log("JS: Joining tall tales game instance.");
        $.post(add_player_url,
            {
            	gametype: gametype,
                room_code: room_code
            },
            function (data) {
                if (data.successful) {
                    self.vue.current_gamestate = data.gamestate;
                    console.log("Joining Room " + self.vue.current_gamestate.room_code);
                    console.log("JS: Returned successfully from API call.");

                    if (self.vue.displaying_public_games) {
						self.vue.displaying_public_games = false; //Turn off if redirecting via "join game" button
                    }

                    //Update in lobby state, which updates HTML
                    self.vue.is_in_game = true;
                    self.vue.show_room_code = false;
                    self.vue_loop(gametype);
                }
                else {
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            }
        );
    };

    /* talltales_leave():
    ----------------------------------------------------------------------------
    Called when a player leaves a lobby.
    ---------------------------------------------------------------------------- */
    self.leave_game = function (gametype) {
    	if (self.vue.current_gamestate != null) {
    		 $.post(remove_player_url,
            {	
            	gametype: gametype,
                room_code: self.vue.current_gamestate.room_code
            },
            function(data) {
                if (data.successful == true) {
                    console.log("JS: Returned successfully from API call.");
                }
                else {
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            });
    		//Update view things, which updates HTML
    		self.vue.is_in_game = false;
            self.vue.is_public = false;
            self.vue.current_story = '';
    	}
    };

    /* vue_loop():
    ----------------------------------------------------------------------------
    Refreshes gamestate for render. Should be called in JS loop with setInterval.
    ---------------------------------------------------------------------------- */
    self.vue_loop = function (gametype) {
        if(self.vue.is_in_game){
            self.vue.db_repeatedquery_timer = setInterval(function() { self.update_vue(gametype); }, 1000);
        }
    };

    self.update_vue = function (gametype) {
        if (self.vue.is_in_game) {
            var oldturn = self.vue.current_gamestate.current_turn
            $.post(get_gamestate_url,
            {
            	gametype: gametype,
                room_code: self.vue.current_gamestate.room_code
            },
            function(data) {
                if (data.successful == true) {
                    self.vue.current_gamestate = data.gamestate;
                    self.update_story();
                    console.log("JS: Returned successfully from API call (update_vue).");
                }
                else {
                    console.log("JS: Returned unsuccessfully from API call (update_vue).");
                }
            });
        }
        else {
            console.log("clearing interval");
            clearInterval(self.vue.db_repeatedquery_timer);
            self.vue.db_repeatedquery_timer = null;
        }
    };
    

    /* toggle_view_room_code():
    ----------------------------------------------------------------------------
    Toggles whether or not the room code should be viewable.
    ---------------------------------------------------------------------------- */
    self.toggle_view_room_code = function () {
        self.vue.show_room_code = !self.vue.show_room_code;
    }



    /* talltales_submitturn():
    ----------------------------------------------------------------------------
    Submits one's turn and advances gamestate's record of whose turn it is.
    ---------------------------------------------------------------------------- */
    self.talltales_submitturn = function () {

        if (self.vue.is_in_game) {
            console.log("Submitting turn for room " + self.vue.current_gamestate.room_code + ".");
            $.post(talltales_taketurn,
            {
                room_code: self.vue.current_gamestate.room_code,
                new_text: self.vue.talltales_new_sentence
            },
            function(data) {
                if (data.successful == true) {
                    self.vue.current_gamestate = data.match;
                    self.update_story();
                    self.vue.talltales_new_sentence = "";
                    console.log("JS: Returned successfully from API call.");
                }
                else {
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            });
        }
        else {
            console.log("Not ur turn to submit stuff.");
        }
    };

    self.update_story = function () {
        var string = '';
        for (var i = 1; i < self.vue.current_gamestate.story_text.length; i++) {
            string += self.vue.current_gamestate.story_text[i] + " ";
        }
        self.vue.current_story = string;
    }

    /* get_games():
    ----------------------------------------------------------------------------
    Retrieves all the games in the database (depending on gametype) and stores them 
    in self.vue.public_games. Passing in 0 to api.py specifies it is a public game, 
    anything else means private. Currently, this is only used for displaying public 
    games so hardcoded to 0.
    ----------------------------------------------------------------------------*/
    self.get_games = function (gametype) {
        console.log("JS: Getting games of type " + gametype);
        
        $.post(get_games_url,
            {
                gametype: gametype
            },
            function (data) {
                if (data.successful) {
                    self.vue.public_games = data.public_games;
                    console.log("Public games = " + data.public_games);
                }
            });

    };

     /* show_games():
    ----------------------------------------------------------------------------
    Function to toggle displaying the public games (in the modal).
    Calls get_games().
    ----------------------------------------------------------------------------*/

    self.show_games = function (gametype) {
        if (!self.vue.displaying_public_games) {
            self.get_games(gametype);
        }
    	self.vue.displaying_public_games = !self.vue.displaying_public_games;

    };

    /* TABOO FUNCTIONS */

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            chosen_nickname: false,
            nickname: "Guest",
            chosen_theme: true,
            theme: 5,

            window_has_focus: true,
            left_game_code: null,
            left_game_type: null,
    
            //Vue variables common to ALL GAMES
            join_room_code: "",
            show_room_code: false,
            displaying_public_games: false,
            db_repeatedquery_timer: null,
            current_gamestate: null, //Object(?) holding the currently viewed game information.
            is_in_game: false,
            is_public: false, //this is toggled by the checkbox on creating a game
            public_games: [],
            current_story: '', //implemented so that the story is printed as a string instead of as an array

            //Talltales things
            talltales_new_sentence: "", //Text box on game page to enter new sentence
            story_title: ""

            //Taboo things
        },
        computed: {
            talltales_button_color: function () {
                return {
                    color_1: this.theme == 1,
                    color_2: this.theme == 2,
                    color_3: this.theme == 3,
                    color_4: this.theme == 4,
                    color_5: this.theme == 5
                }
            },
            taboo_button_color: function () {
                return {
                    
                }
            },
            typeracer_button_color: function () {
                return {
                    
                }
            },
            gamebar_color: function () {
                return {
                    gamebar_1: this.theme == 1,
                    gamebar_2: this.theme == 2,
                    gamebar_3: this.theme == 3,
                    gamebar_4: this.theme == 4,
                    gamebar_5: this.theme == 5
                }
            }
        },
        methods: {
            is_user_in_user_accounts: self.is_user_in_user_accounts,
            update_current_user: self.update_current_user,
            switch_theme: self.switch_theme,
            api_tester: self.api_tester,
            initialize: self.initialize,
            join_by_stored_code: self.join_by_stored_code, //specific for join where we store code via v-model
            join_by_code: self.join_by_code, //specific for join where we receive code as param to function
            talltales_submitturn: self.talltales_submitturn,
            leave_game: self.leave_game,
	   		get_games: self.get_games,
            show_games: self.show_games,
            vue_loop: self.vue_loop,
            get_nickname: self.get_nickname,
            set_nickname: self.set_nickname,
            toggle_view_room_code: self.toggle_view_room_code,
            get_theme: self.get_theme
        }

    });

    self.get_theme();
    change_background();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
