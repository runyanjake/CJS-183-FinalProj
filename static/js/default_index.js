// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    //Function to call the game-leaving function on page unload
    $(window).unload(function(){
        self.talltales_leave();
    });

    //load background so it stays for each page
    change_background = function () {
        if (sessionStorage.getItem('bg_color')) {
            
            document.body.style.backgroundColor = sessionStorage.getItem('bg_color');

        }else{
            console.log("entered else");
            document.body.style.backgroundColor =  "#b67fff";
            sessionStorage.setItem('bg_color', "#b67fff");
        }
    };

    //Toggle themes
    self.switch_theme = function (theme_code) {
        //green theme
        if (theme_code == 1) {
            document.body.style.background = "#74d300";
            sessionStorage.setItem('bg_color', "#74d300");
        }
        //turquoise theme
        else if (theme_code == 2) {
            document.body.style.background = "#2dd8bf";
            sessionStorage.setItem('bg_color', "#2dd8bf");
        }
        //pink theme
        else if (theme_code == 3) {
            document.body.style.background = "#ff91ca";
            sessionStorage.setItem('bg_color', "#ff91ca");
        }
        //orange theme
        else if (theme_code == 4) {
            document.body.style.background = "#ffb30f";
            sessionStorage.setItem('bg_color', "#ffb30f");
        }
        //purple theme
        else if (theme_code == 5) {
            document.body.style.background = "#b67fff";
            sessionStorage.setItem('bg_color', "#b67fff");
        }
    };

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    //Used by Jake for API testing.
    self.api_tester = function(){
        var choice = 3;
        if(choice == 1){
            console.log("Testing API test 1 (talltales_init)");
            $.post(talltales_init,
                {
                    is_public: false,
                    max_players: 15,
                    turn_time_limit: 30,
                    story_title: "New story!"
                },
                function(data) {
                    if(data.successful == true)
                        console.log("JS: Returned successfully from API call.");
                    else
                        console.log("JS: Returned unsuccessfully from API call.");
                });
        }else if(choice == 2){
            console.log("Testing API test 2 (talltales_addplayer)");
            $.post(talltales_addplayer,
                {
                    room_code: 215950
                },
                function(data) {
                    if(data.successful)
                        console.log("JS: Returned successfully from API call.");
                    else
                        console.log("JS: Returned unsuccessfully from API call.");
                });
        }else if(choice == 3){
            console.log("Testing API test 3 (talltales_getgamestate)");
            $.post(talltales_getgamestate,
                {
                    room_code: 898954
                },
                function(data) {
                    if(data.successful){
                        console.log("JS: Returned successfully from API call.");
                    }else{
                        console.log("JS: Returned unsuccessfully from API call.");
                    }
                });
        }else if(choice == 4){
            console.log("Testing API test 4 (talltales_updategamestate)");
            $.post(talltales_updategamestate,
                {
                    room_code: 893346,
                    story_text: "THis is part of a story!"
                },
                function(data) {
                    if(data.successful)
                        console.log("JS: Returned successfully from API call.");
                    else
                        console.log("JS: Returned unsuccessfully from API call.");

                });
        }else if(choice == 5){
            console.log("Testing API test 5 (talltales_getgames)");
            $.post(talltales_getgames,
                {

                },
                function(data) {
                    if(data.successful)
                        console.log("JS: Returned successfully from API call.");
                    else
                        console.log("JS: Returned unsuccessfully from API call.");
                });
        }else if(choice == 6){
            console.log("Testing API test 6 (talltales_removeplayer)");
            $.post(talltales_removeplayer,
                {
                    room_code: 215950
                },
                function(data) {
                    if(data.successful)
                        console.log("JS: Returned successfully from API call.");
                    else
                        console.log("JS: Returned unsuccessfully from API call.");
                });
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

        $.post(init,
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
                    //Update in lobby state, which updates HTML
                    self.vue.is_in_game = true;
                    self.vue_loop();
                }
                else {
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            });
        
    };

    /* talltales_join_by_stored_code():
    ----------------------------------------------------------------------------
    User can join a private game by entering a room code (presumably shared with them by a friend).
    Room codes are set via v-model to self.vue.join_room_code
    Adds that user to the player_list for the game associated with that room code
    ----------------------------------------------------------------------------*/
    self.talltales_join_by_stored_code = function () {
        self.vue.talltales_join_by_code(self.vue.join_room_code);
        self.vue.join_room_code = "";
    };

    /* talltales_join_public():
    ----------------------------------------------------------------------------
    User can join a public game by passing the public game's room code.
    Adds that user to the player_list for the game associated with that room code
    ----------------------------------------------------------------------------*/
    self.talltales_join_by_code = function (room_code) {
        console.log("JS: Joining tall tales game instance.");
        $.post(talltales_addplayer,
            {
                room_code: room_code
            },
            function (data) {
                if (data.successful) {
                    self.vue.current_gamestate = data.gamestate;
                    console.log("Joining Room " + self.vue.current_gamestate.room_code);
                    console.log("JS: Returned successfully from API call.");

                    if(self.vue.displaying_public_games)
                        self.vue.displaying_public_games = false; //Turn off if redirecting via "join game" button
                    console.log("displaying tall tales games = " + self.vue.displaying_public_games);

                    //Update in lobby state, which updates HTML
                    self.vue.is_in_game = true;
                    self.vue_loop();
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
    self.talltales_leave = function () {
        $.post(talltales_removeplayer,
            {
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
    };

    /* vue_loop():
    ----------------------------------------------------------------------------
    Refreshes gamestate for render. Should be called in JS loop with setInterval.
    ---------------------------------------------------------------------------- */
    self.vue_loop = function() {
        if(self.vue.is_in_game){
            self.vue.db_repeatedquery_timer = setInterval(self.update_vue, 2000);
        }
    };

    self.update_vue = function () {
        if (self.vue.is_in_game) {
            console.log("Updating gamestate for room " + self.vue.current_gamestate.room_code + ".");
            $.post(talltales_getgamestate,
            {
                room_code: self.vue.current_gamestate.room_code
            },
            function(data) {
                if(data.successful == true){
                    self.vue.current_gamestate = data.match;
                    console.log("JS: Returned successfully from API call.");
                }else{
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            });
        }
        else {
            clearInterval(self.vue.db_repeatedquery_timer);
            self.vue.db_repeatedquery_timer = null;
        }
    };

    /* talltales_submitturn():
    ----------------------------------------------------------------------------
    Submits one's turn and advances gamestate's record of whose turn it is.
    ---------------------------------------------------------------------------- */
    self.talltales_submitturn = function () {
        if(self.vue.is_in_game){
            console.log("Submitting turn for room " + self.vue.current_gamestate.room_code + ".");
            $.post(talltales_taketurn,
            {
                room_code: self.vue.current_gamestate.room_code,
                new_text: self.vue.talltales_new_sentence
            },
            function(data) {
                if(data.successful == true){
                    self.vue.current_gamestate = data.match;
                    console.log("JS: Returned successfully from API call.");
                }else{
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            });
        }else{
            console.log("Not ur turn to submit stuff.");
        }
    };

    

    /* get_games():
    ----------------------------------------------------------------------------
    Retrieves all the games in the database (depending on gametype) and stores them 
    in self.vue.public_games. Passing in 0 to api.py specifies it is a public game, 
    anything else means private. Currently, this is only used for displaying public 
    games so hardcoded to 0.
    ----------------------------------------------------------------------------*/
    self.get_games = function (gametype) {
        console.log("get_games clicked");
        
        $.post(talltales_getgames, 
            {
                public: 0
            },
            function (data) {
            	console.log("get_games reached fucntion");
                self.vue.public_games = data.public_games;
                console.log("public games = " + data.public_games);
            });
       
    };

     /* show_games():
    ----------------------------------------------------------------------------
    Function to toggle displaying the public games (in the modal).
    Calls get_games().
    ----------------------------------------------------------------------------*/

    self.show_games = function (gametype) {

    	self.get_games(gametype);
    	self.vue.displaying_public_games = !self.vue.displaying_public_games;

    };
   
    /* TABOO FUNCTIONS */

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {

            //Vue variables common to ALL GAMES
            join_room_code: "",
            displaying_public_games: false,
            db_repeatedquery_timer: null,
            current_gamestate: null, //Object(?) holding the currently viewed game information.
            is_in_game: false,
            is_public: false, //this is toggled by the checkbox on creating a game
            public_games: [],

            //Talltales things
            talltales_new_sentence: "", //Text box on game page to enter new sentence
            story_title: ""

            //Taboo things
        },
        methods: {
            switch_theme: self.switch_theme,
            api_tester: self.api_tester,
            initialize: self.initialize,
            talltales_join_by_stored_code: self.talltales_join_by_stored_code, //specific for join where we store code via v-model
            talltales_join_by_code: self.talltales_join_by_code, //specific for join where we receive code as param to function
            talltales_submitturn: self.talltales_submitturn,
            talltales_leave: self.talltales_leave,
	   		get_games: self.get_games,
            show_games: self.show_games,
            taboo_init: self.taboo_init,
        }

    });

    change_background();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
