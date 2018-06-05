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
    
    #if private game, generate room code, else room code = 0
    if request.vars.public_game == "false":
        #generate a unique room code.
        id=random.random()*MAX_ROOM_COUNT
        room_code = int(id)
        matches = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
        if matches is not None:
            id=random.random()*MAX_ROOM_COUNT ###### this is a theoretical infinite loop if we get unlucky with random, maybe do a loop if not found?
            room_code = int(id)
            matches = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    else: 
        room_code = 0
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
        successful = True,
        room_code = room_code
    ))

#Updates the gamestate.
#### incoming packet should hold: ####
#   request.vars.room_code = room code to add to.
#   request.vars.story_text = next line to append.
#   request.vars.current_turn = id of auth_user who's turn it is.
#### Leave a value blank if you don't want it to update.
@auth.requires_login()
def update_gamestate_talltales():
    print("API: Updating Talltales gamestate " + str(request.vars.room_code) + ".")
    match = db(request.vars.room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    if match is None:
        return response.json(dict(
            successful=False
        ))
    else:
        if request.vars.story_text is not None:
            story = match.story_text
            story.append(request.vars.story_text)
            db(request.vars.room_code == db.talltales_instances.room_code).update(story_text=story)
        if request.vars.current_turn is not None:
            db(request.vars.room_code == db.talltales_instances.room_code).update(current_turn=request.vars.current_turn)
        return response.json(dict(
            successful=True
        ))

#for re-rendering the webpage periodically to check for gamestate updates
@auth.requires_login()
def retrieve_gamestate_talltales():
    print("API: Retrieving Talltales gamestate " + str(room_code) + ".")
    match = db(request.vars.room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    if match is None:
        return response.json(dict(
            successful=False
        ))
    else:
        return response.json(dict(
            successful=True,
            player_list=match.player_list,
            max_players=match.max_players,
            turn_time_limit=match.turn_time_limit,
            story_text=match.story_text,
            current_turn=match.current_turn
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
    if room is not None:
        player_list = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.player_list).first().player_list
        if auth.user.id in player_list:
            print("API: User " + str(auth.user.id) + " is already in game instance " + str(room_code) + ".")
            return response.json(dict(
                successful=False
            ))
        else:
            player_list.append(auth.user.id)
            db(room_code == db.talltales_instances.room_code).update(player_list=player_list)
            print("API: Added user " + str(auth.user.id) + " to game instance " + str(room_code) + ".")
            return response.json(dict(
                successful=True
            ))
    else:
        print("API: Game instance " + str(room_code) + " does not exist.")
        return response.json(dict(
            successful=False
        ))

#Remove a user from a game.
@auth.requires_login()
def remove_player_talltales():
    print("API: Attempting to remove player from existing instance of TallTales.")
    room_code = request.vars.room_code
    room = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    if room is not None:
        player_list = db(room_code == db.talltales_instances.room_code).select(
            db.talltales_instances.player_list).first().player_list
        if auth.user.id not in player_list:
            print("API: User " + str(auth.user.id) + " was never in game instance " + str(room_code) + ".")
            return response.json(dict(
                successful=False
            ))
        else:
            new_player_list = []
            for player_id in player_list:
                if auth.user.id != player_id:
                    new_player_list.append(player_id)
            db(room_code == db.talltales_instances.room_code).update(player_list=new_player_list)
            print("API: Removed user " + str(auth.user.id) + " from game instance " + str(room_code) + ".")
            return response.json(dict(
                successful=True
            ))
    else:
        print("API: Game instance " + str(room_code) + " does not exist.")
        return response.json(dict(
            successful=False
        ))

        #Delete a game by id.
@auth.requires_signature()
def delete_game_talltales():
    return response.json(dict(
        successful=False
    ))
    
#Update the vue listing for currently alive games.
#Receive a unique room code and return everything under that room code.
def get_games_talltales():
    #send in 0 for public game, otherwise send something else
    if request.vars.public == '0':
        rows = db(db.talltales_instances.room_code == 0).select(db.talltales_instances.ALL)
        print("API: Retrieving public instances of TallTales games.")
    else:
        rows = db().select(db.talltales_instances.ALL)
        print("API: Retrieving all instances of TallTales games.")
    games = []
    for r in rows:
        print(r)
    
    for r in rows:
        t = dict(
            room_code = r.room_code,
            player_list = r.player_list,
            hoster = r.hoster,
            max_players = r.max_players,
            turn_time_limit = r.turn_time_limit,
            story_text = r.story_text,
            current_turn = r.current_turn
        )
        print(t)
        games.append(t)

    return response.json(dict(
        talltales_games=games
    ))