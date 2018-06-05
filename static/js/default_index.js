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
<<<<<<< HEAD
        var choice = 1;
=======
        console.log("Running an API function test. (Make sure you're signed in!)");
        var choice = 6;
>>>>>>> 6d7cf35aee4b1ef9d37d76e342e0a329c8b7ad1b
        if(choice == 1){
            console.log("Testing API test 1 (talltales_init)");
            $.post(talltales_init,
                {
                    max_players: 15,
                    turn_time_limit: 30,
                    initial_sentence: "This here is a story"
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
                    room_code: 588666
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
                    room_code: 588666
                },
                function(data) {
                    if(data.successful)
                        console.log("JS: Returned successfully from API call.");
                    else
                        console.log("JS: Returned unsuccessfully from API call.");
                });
        }else if(choice == 4){
            console.log("Testing API test 4 (talltales_updategamestate)");
            $.post(talltales_updategamestate,
                {
                    room_code: 588666,
                    story_text: "Third thing in story"
                },
                function(data) {
                    if(data.successful)
                        console.log("JS: Returned successfully from API call.");
                    else
                        console.log("JS: Returned unsuccessfully from API call.");

                });
        }else if(choice == 5){
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
            $.post(talltales_removeplayer,
                {
                    room_code: 588666
                },
                function(data) {
                    if(data.successful)
                        console.log("JS: Returned successfully from API call.");
                    else
                        console.log("JS: Returned unsuccessfully from API call.");
                });
        }
    }

    self.test_check = function () {
        console.log("check = " + self.vue.tester);
    }

    self.talltales_initialize = function () {


        $.post(talltales_init,
            {
                max_players: 15,
                turn_time_limit: 30,
                initial_sentence: self.vue.initial_sentence,
                public_game: self.vue.public_game
            },
            function(data) {
                if(data.successful == true)
                    console.log("JS: Returned successfully from API call.");
                else
                    console.log("JS: Returned unsuccessfully from API call.");
            });
    }

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

    

    //Testing getting the get games method to retrieve the necessary info
    // self.get_games_tester = function () {
    //     $.post(talltales_getgames, 
    //         {

    //         },
    //         function (data) {
    //             self.vue.talltales_games = data.talltales_games;
    //             console.log("cassia returned from API");
    //         })
    // }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            talltales_games: [],
            room_code: "",
            initial_sentence: "",
            public_game: false,   //not sure what this should be initialized to, can make it default to public
            tester: false
        },
        methods: {
            api_tester: self.api_tester,
            join_room_code: self.join_room_code,
            talltales_initialize: self.talltales_initialize,
            test_check: self.test_check
            //get_games_tester: self.get_games_tester
        }

    });

    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
