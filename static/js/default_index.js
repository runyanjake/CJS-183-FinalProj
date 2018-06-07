// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

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
                    self.vue.current_room_code = data.room_code;
                }else{
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            });
        //Update in lobby state, which updates HTML
        self.vue.is_in_lobby = true;
    }

    /* talltales_join_by_stored_code():
    ----------------------------------------------------------------------------
    User can join a private game by entering a room code (presumably shared with them by a friend).
    Room codes are set via v-model to self.vue.join_room_code
    Adds that user to the player_list for the game associated with that room code
    ----------------------------------------------------------------------------*/
    self.talltales_join_by_stored_code = function () {
//        console.log("join_room_code pressed: " + self.vue.join_room_code);
//        $.post(talltales_addplayer,
//            {
//                room_code: self.vue.join_room_code
//            },
//            function (data) {
//                if(data.successful) {
//                    self.vue.current_room_code = self.vue.join_room_code;
//                    console.log("Joining Room " + self.vue.current_room_code);
//                    self.vue.join_room_code = "";
//                    console.log("JS: Returned successfully from API call.");
//                }
//                else {
//                    console.log("JS: Returned unsuccessfully from API call.");
//                }
//            }
//        );
//        //Update in lobby state, which updates HTML
//        self.vue.is_in_lobby = true;
        self.vue.talltales_join_by_code(self.vue.join_room_code);
        self.vue.join_room_code = "";
    };

    /* talltales_join_public():
    ----------------------------------------------------------------------------
    User can join a public game by passing the public game's room code.
    Adds that user to the player_list for the game associated with that room code
    ----------------------------------------------------------------------------*/
    self.talltales_join_by_code = function (room_code) {
        $.post(talltales_addplayer,
            {
                room_code: room_code
            },
            function (data) {
                if(data.successful) {
                    self.vue.current_room_code = room_code;
                    console.log("Joining Room " + self.vue.current_room_code);
                    console.log("JS: Returned successfully from API call.");
                }
                else {
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            }
        );
        //Update in lobby state, which updates HTML
        self.vue.is_in_lobby = true;
    };

    /* talltales_leave():
    ----------------------------------------------------------------------------
    Called when a player leaves a lobby.
    ---------------------------------------------------------------------------- */
    self.talltales_leave = function () {
        $.post(talltales_removeplayer,
            {
                room_code: self.vue.current_room_code
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
            current_gamestate: null, //Object(?) holding the currently viewed game information.
            current_room_code: -1,
            is_in_lobby: false,

            //Shane's Taboo things
            //Jake: i think that we should hold all of the gamestate in its own vue var
            //(for talltales i did current_gamestate which is returned a row from the API)
            host: null,
            player_list: [],



        },
        methods: {
            api_tester: self.api_tester,
            talltales_initialize: self.talltales_initialize,
            talltales_join_by_stored_code: self.talltales_join_by_stored_code, //specific for join where we store code via v-model
            talltales_join_by_code: self.talltales_join_by_code, //specific for join where we receive code as param to function
            talltales_leave: self.talltales_leave,
            get_games: self.get_games_tester,
            show_games: self.show_games
        }

    });

    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
