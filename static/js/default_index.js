// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    //load background so it stays for each page
    change_background = function () {
        if (sessionStorage.getItem('bg_color')) {
            console.log("entered if");
            console.log("session storage = " + sessionStorage.getItem('bg_color'));
            document.body.style.backgroundColor = sessionStorage.getItem('bg_color');
            console.log("session storage = " + sessionStorage.getItem('bg_color'));

        }else{
            console.log("entered else");
            document.body.style.backgroundColor =  "#ffd621";
            sessionStorage.setItem('bg_color', "#ffd621");
        }
    }
    //Toggle themes
    self.switch_theme = function (theme_code) {
        //yellow theme
        if (theme_code == 1) {
            document.body.style.background = "#ffd621";
            sessionStorage.setItem('bg_color', "#ffd621");
        }
        //teal theme
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
        else if (theme_code == 5) {
            document.body.style.background = "#b67fff";
            sessionStorage.setItem('bg_color', "#b67fff");
        }
    }

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
                    initial_sentence: "New story!"
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
    }

    /* talltales_initialize():
    ----------------------------------------------------------------------------
    Creates a public or private instance of talltales in the database.
    Currently, max_players and turn_time_limit are defaulted but in the future we 
    probably want users to be able to select those values themselves.
    ---------------------------------------------------------------------------- */
    self.talltales_initialize = function () {
        console.log("JS: Creating tall tales game instance.");
        $.post(talltales_init,
            {
                max_players: 15,
                turn_time_limit: 30,
                initial_sentence: self.vue.initial_sentence,
                is_public: self.vue.is_public
            },
            function(data) {
                if(data.successful == true){
                    console.log("JS: Returned successfully from API call.");
                    self.vue.current_gamestate = data.gamestate;
                    //Update in lobby state, which updates HTML
                    self.vue.is_in_lobby = true;
                    self.talltales_gameloop();
                }else{
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            });
    }

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
                if(data.successful) {
                    self.vue.current_gamestate = data.gamestate;
                    console.log("Joining Room " + self.vue.current_gamestate.room_code);
                    console.log("JS: Returned successfully from API call.");

                    if(self.vue.displaying_talltale_games)
                        self.vue.displaying_talltale_games = false; //Turn off if redirecting via "join game" button
                    console.log("displaying tall tales games = " + self.vue.displaying_talltale_games);

                    //Update in lobby state, which updates HTML
                    self.vue.is_in_lobby = true;
                    self.talltales_gameloop();
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
                if(data.successful == true){
                    console.log("JS: Returned successfully from API call.");
                }else{
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            });
        //Update view things, which updates HTML
        self.vue.is_in_lobby = false;
        self.vue.is_public = false;
    }

    /* talltales_gameloop():
    ----------------------------------------------------------------------------
    Refreshes gamestate for render. Should be called in JS loop with setInterval.
    ---------------------------------------------------------------------------- */
    self.talltales_gameloop = function() {
        if(self.vue.is_in_lobby){
            self.vue.db_repeatedquery_timer = setInterval(self.talltales_gamerefresh, 2000);
        }
    }
    self.talltales_gamerefresh = function () {
        if(self.vue.is_in_lobby){
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
        }else{
            clearInterval(self.vue.db_repeatedquery_timer);
            self.vue.db_repeatedquery_timer = null;
        }
    }

    

    /* get_games():
    ----------------------------------------------------------------------------
    Retrieves all the games in db.talltales_instances and stores them in self.vue.talltales_games.
    Passing in 0 to api.py specifies it is a public game, anything else means private.
    Currently, this is only used for displaying public games so hardcoded to 0.
    ----------------------------------------------------------------------------*/
    self.get_games = function () {
        console.log("get_games clicked");
        
        $.post(talltales_getgames, 
            {
                public: 0
            },
            function (data) {
                self.vue.talltales_games = data.talltales_games;
                console.log("cassia returned from API");
            });
    };

    /* show_games():
    ----------------------------------------------------------------------------
    Function to toggle displaying the public games (in the modal).
    Calls get_games().
    ----------------------------------------------------------------------------*/
    self.show_games = function() {
        console.log("show_games clicked");
        self.get_games();
        self.vue.displaying_talltale_games = !self.vue.displaying_talltale_games;
        console.log("displaying_talltales_games = " + self.vue.displaying_talltale_games);
    };

    /* TABOO FUNCTIONS */

    self.taboo_init = function() {
        $.post(taboo_init_url,
            { 
                max_players: self.vue.max_players,
                turn_time_limit: self.vue.turn_time_limit,
                is_public: self.vue.is_public
            },
            function(data) {
                self.vue.player_list = data.player_list;
                self.vue.host = self.vue.player_list[0];
            });
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            //Join via new game vue variables
            talltales_games: [],
            is_public: false,   //not sure what this should be initialized to, can make it default to public
            initial_sentence: "",

            //Join via room_code vue variables
            join_room_code: "",

            //Join via global vue variables
            displaying_talltale_games: false,

            //Vue variables common to ALL GAMES
            db_repeatedquery_timer: null,
            current_gamestate: [], //Object(?) holding the currently viewed game information.
            is_in_lobby: false,

            //Shane's Taboo things
            //Jake: i think that we should hold all of the gamestate in its own vue var
            //(for talltales i did current_gamestate which is returned a row from the API)
            host: null,
            player_list: [],



        },
        methods: {
            switch_theme: self.switch_theme,
            api_tester: self.api_tester,
            talltales_initialize: self.talltales_initialize,
            talltales_join_by_stored_code: self.talltales_join_by_stored_code, //specific for join where we store code via v-model
            talltales_join_by_code: self.talltales_join_by_code, //specific for join where we receive code as param to function
            talltales_leave: self.talltales_leave,
            get_games: self.get_games_tester,
            show_games: self.show_games
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
