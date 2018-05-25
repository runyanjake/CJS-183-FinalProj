# Here go your api methods.

# import uuid
import random

## The max number of unique rooms that can exist in the database.
MAX_ROOM_COUNT = 999999

#### TALL TALES API METHODS ####

#Initialize a new instnce of the game.
#### incoming packet should hold: ####
#   request.vars.max_players = max number of players in the game.
#   request.vars.turn_limit = length of a turn in seconds.
#   request.vars.initial_sentence = first sentence or title of the story
# @auth.requires_signature()
@auth.requires_login()
def init_talltales():
    print("API: Creating a new instance of TallTales.")
    #generate a unique room code.
    id=random.random()*MAX_ROOM_COUNT
    room_code = int(id)
    matches = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    if matches is not None:
        id=random.random()*MAX_ROOM_COUNT ###### this is a theoretical infinite loop if we get unlucky with random, maybe do a loop if not found?
        room_code = int(id)
        matches = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    print("API: Created instance with room_code " + str(room_code))
    players = []
    players.append(auth.user.id)
    hoster = auth.user.id
    story_text = []
    story_text.append(request.vars.initial_sentence)
    db.talltales_instances.insert(
        room_code = room_code,
        player_list = players,
        hoster = hoster,
        max_players = request.vars.max_players,
        turn_time_limit = request.vars.turn_time_limit,
        story_text = story_text
    )
    return response.json(dict(
        successful = True
    ))

#Add this user to an existing instance of the game.
#### incoming packet should hold: ####
#   request.vars.room_code = room code to add to.
#   request.vars.turn_limit = length of a turn in seconds.
#   request.vars.initial_sentence = first sentence or title of the story
# @auth.requires_signature()
@auth.requires_login()
def add_player_talltales():
    print("API: Attempting to add player to existing instance of TallTales.")
    room_code = request.vars.room_code
    room = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    player_list = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.player_list).first().player_list
    if auth.user.id in player_list:
        print("API: User is already in the game.")
        return response.json(dict(
            successful=False
        ))
    else:
        player_list.append(auth.user.id)
        db(room_code == db.talltales_instances.room_code).update(player_list=player_list)
        print("API: Added user to game.")
        return response.json(dict(
            successful=True
        ))

# #Maybe we want this method? Otherwise idk how we keep game updated. This will require additions to the database.
# #This should accommodate skipping a turn due to timeout and taking a turn normally
# @auth.requires_login()
# def update_gamestate():
# #Maybe we want this method? Otherwise idk how we keep game updated. This will require additions to the database.
# @auth.requires_login()
# def retrieve_gamestate():


#Update the vue listing for currently alive games.
#Receive a unique room code and return everything under that room code.
# def get_games_talltales():
#     print("API: Retrieving all instances of TallTales games.")
#     games = []
#     rows = db().select(db.talltales_instances.ALL)
#     for i, r in rows:
#         t = dict(
#             room_code = r.room_code,
#             player_list = r.player_list,
#             hoster = r.hoster,
#             max_players = r.max_players,
#             turn_time_limit = r.turn_time_limit,
#             secret_word = r.secret_word,
#             player_scores = r.player_scores
#         )
#         games.append(t)

#     return response.json(dict(
#         talltales_games=games
#     ))