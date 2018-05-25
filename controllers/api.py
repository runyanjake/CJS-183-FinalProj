# Here go your api methods.

import uuid

#### TALL TALES API METHODS ####

#Initialize a new instnce of the game.
# @auth.requires_signature()
@auth.requires_login()
def init_talltales():
    print("API: Creating a new instance of TallTales.")
    #generate a unique room code.
    room_code = uuid.uuid4()
    matches = db().select(db.talltales_instances.ALL)
    if matches is None:
        print("No matches, good")
    print(room_code)

#Add this user to an existing instance of the game.
# @auth.requires_signature()
@auth.requires_login()
def add_player_talltales():
    print("API: Adding player to existing instance of TallTales.")

#Update the vue listing for currently alive games.
#Receive a unique room code and return everything under that room code.
def get_games_talltales():
    print("API: Retrieving all instances of TallTales games.")
    games = []
    rows = db().select(db.talltales_instances.ALL)
    for i, r in rows:
        t = dict(
            room_code = r.room_code,
            player_list = r.player_list,
            hoster = r.hoster,
            max_players = r.max_players,
            turn_time_limit = r.turn_time_limit,
            secret_word = r.secret_word,
            player_scores = r.player_scores
        )
        games.append(t)

    return response.json(dict(
        talltales_games=games
    ))