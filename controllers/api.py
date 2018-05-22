# Here go your api methods.

import uuid

#### TALL TALES API METHODS ####

#Initialize a new instnce of the game.
# @auth.requires_signature()
# incoming packet should hold:
#   request.vars.max_players = max number of players in the game.
#   request.vars.turn_limit = length of a turn in seconds.
#   request.vars.initial_sentence = first sentence or title of the story
@auth.requires_login()
def init_talltales():
    print("API: Creating a new instance of TallTales.")
    #generate a unique room code.
    id = uuid.uuid1()
    room_code = id.int
    matches = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    if matches is not None:
        id = uuid.uuid1()
        room_code = id.int
        matches = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    print("API: Created instance with room_code " + str(room_code))
    players = []
    players.append(auth.user.id)
    hoster = auth.user.id
    story_text = []
    story_text.append(request.vars.initial_sentence)
    print("Players: " + str(players))
    print("Hoster: " + str(hoster))
    db.talltales_instances.insert(
        room_code = room_code,
        player_list = players,
        hoster = hoster,
        max_players = request.vars.max_players,
        turn_time_limit = request.vars.turn_time_limit,
        story_text = story_text
    )
    print("Table now holds: ")
    print(db().select(db.talltales_instances.ALL))

#Add this user to an existing instance of the game.
# @auth.requires_signature()
@auth.requires_login()
def add_player_talltales():
    print("API: Adding player to existing instance of TallTales.")

#Update the vue listing for currently alive games.
def get_games_talltales():
    print("API: Retrieving all instances of TallTales games.")