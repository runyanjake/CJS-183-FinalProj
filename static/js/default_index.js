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
                is_public: self.vue.checkbox_is_public
            },
            function(data) {
                if(data.successful == true)
                    console.log("JS: Returned successfully from API call.");
                else
                    console.log("JS: Returned unsuccessfully from API call.");
            });
    }

    /* join_room_code():
    ----------------------------------------------------------------------------
    User can join a private game by entering a room code (presumably shared with them by a friend).
    Adds that user to the player_list for the game associated with that room code
    ----------------------------------------------------------------------------*/
    self.join_room_code = function () {
        console.log("join_room_code pressed: " + self.vue.room_code);
        $.post(talltales_addplayer, 
            {
                room_code: self.vue.room_code
            }, 
            function (data) {
                if(data.successful) {
                    self.vue.room_code = "";
                    console.log("JS: Returned successfully from API call.");
                }
                else {
                    console.log("JS: Returned unsuccessfully from API call.");
                }
            }
        );
    };

    

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
            })
    }

    /* show_games():
    ----------------------------------------------------------------------------
    Function to toggle displaying the public games (in the modal).
    Calls get_games().
    ----------------------------------------------------------------------------*/
    self.show_games = function() {
        console.log("show_games clicked");
        self.vue.displaying_talltale_games = !self.vue.displaying_talltale_games;
        console.log("displaying_talltales_games = " + self.vue.displaying_talltale_games);
        self.get_games();
    }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            talltales_games: [],
            room_code: "",
            initial_sentence: "",
            checkbox_is_public: false,   //not sure what this should be initialized to, can make it default to public
            displaying_talltale_games: false
        },
        methods: {
            api_tester: self.api_tester,
            join_room_code: self.join_room_code,
            talltales_initialize: self.talltales_initialize,
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
