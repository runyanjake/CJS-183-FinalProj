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
        $.post(talltales_init,
            {

            },
            function(data) {
                console.log("JS: Returned from API call.");
            })
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
