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

    //
    /*
    self.open_nav = function () {
        var s = $("#settings");
        if (s) {
            if (!self.vue.settings_open) {
                $("#settings").style.width = "250px";
                
            } else {
                $("#settings").style.width = "0px";
            }
        }
        self.vue.settings_open = !self.vue.settings_open;
    }*/

    //Used by Jake for API testing.
    self.api_tester = function(){
        var choice = 4;
        if(choice == 1){
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
            $.post(talltales_addplayer,
                {
                    room_code: 462385
                },
                function(data) {
                    if(data.successful)
                        console.log("JS: Returned successfully from API call.");
                    else
                        console.log("JS: Returned unsuccessfully from API call.");
                });
        }else if(choice == 3){
            $.post(talltales_getgamestate,
                {
                    room_code: 462385
                },
                function(data) {
                    if(data.successful)
                        console.log("JS: Returned successfully from API call.");
                    else
                        console.log("JS: Returned unsuccessfully from API call.");
                });
        }else if(choice == 4){
            $.post(talltales_updategamestate,
                {
                    room_code: 462385,
                    turn_time_limit: 45,
                    max_players: 12
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
        }
    }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            //settings_open: false
        },
        methods: {
            //open_nav : self.open_nav
            api_tester: self.api_tester
        }

    });

    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
