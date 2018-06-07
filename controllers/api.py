# Here go your api methods.

# import uuid
import random

## The max number of unique rooms that can exist in the database.
MAX_ROOM_COUNT = 999999

########################################################################
######################## TALL TALES API METHODS ########################
########################################################################

#### Initializes a new instnce of the talltales game.
# incoming packet contents:
#   request.vars.is_public = is game public?.
#   request.vars.max_players = max number of players in the game.
#   request.vars.turn_time_limit = length of a turn in seconds.
#   request.vars.initial_sentence = first sentence or title of the story
# returns:
#   room_code = new room's code.
#   successful = success value.
@auth.requires_login()
def init_talltales():
    print("API: Creating a new instance of TallTales.")

    # generate a unique room code.
    id = random.random() * MAX_ROOM_COUNT
    room_code = int(id)
    matches = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    attempts = 0
    while matches is not None and attempts < 1000:
        id = random.random() * MAX_ROOM_COUNT  ###### this is a theoretical infinite loop if we get unlucky with random, maybe do a loop if not found?
        room_code = int(id)
        matches = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
        ++attempts

    if attempts != 1000:
        players = []
        players.append(auth.user.id)
        hoster = auth.user.id
        story_text = []
        story_text.append(request.vars.initial_sentence)
        if (request.vars.is_public == 'true' or request.vars.is_public == True):
            db.talltales_instances.insert(
                room_code=room_code,
                is_public=True,
                player_list=players,
                hoster=hoster,
                max_players=request.vars.max_players,
                turn_time_limit=request.vars.turn_time_limit,
                story_text=story_text
            )
        else:
            db.talltales_instances.insert(
                room_code=room_code,
                is_public=False,
                player_list=players,
                hoster=hoster,
                max_players=request.vars.max_players,
                turn_time_limit=request.vars.turn_time_limit,
                story_text=story_text
            )

        print("API: Created instance with room_code " + str(room_code))
        return response.json(dict(
            successful=True,
            room_code=room_code
        ))
    else:
        print("API: Failed to create game instance.")
        return response.json(dict(
            successful=False,
            room_code=-1
        ))

#@TODO JAKE: update_gamestate_talltales should verify logged in user is in that game (and that it's their turn?)

#### Updates any gamestate the currently logged in user belongs to.
# incoming packet contents
#   request.vars.room_code = room code to add to.
#   request.vars.story_text = next line to append.
#   request.vars.current_turn = id of auth_user who's turn it is.
#   (Leave a value blank if you don't want it to update.)
# returns:
#   successful = success value.
@auth.requires_login()
def update_gamestate_talltales():
    print("API: Updating Talltales gamestate " + str(request.vars.room_code) + ".")
    match = db(request.vars.room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    if match is None:
        return response.json(dict(
            successful=False
        ))
    else:
        if auth.user.id not in match.player_list:
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

#### Returns the most recent database version of the gamestate for re-rendering the webpage periodically.
# incoming packet contents:
#   request.vars.room_code = room code to get gamestate
# returns:
#   match = the match (a row) containing gamestate info
#   successful = success value.
@auth.requires_login()
def retrieve_gamestate_talltales():
    print("API: Retrieving Talltales gamestate " + str(request.vars.room_code) + ".")
    match = db(request.vars.room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    if match is None or auth.user.id not in match.player_list:
        return response.json(dict(
            successful=False
        ))
    else:
        return response.json(dict(
            match=match,
            successful=True
        ))

#### Add this user to an existing instance of the game.
# incoming packet contents:
#   request.vars.room_code = room code to add to.
# returns:
#   successful = success value.
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

####Remove a user from a game.
# incoming packet contents:
#   request.vars.room_code = room code to remove from to.
# returns:
#   successful = success value.

@auth.requires_login()
def remove_player_talltales():
    print("API: Attempting to remove player from existing instance of TallTales.")
    room_code = request.vars.room_code
    room = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    if room is not None:
        game = db(room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
        player_list = game.player_list
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
            if new_player_list == []:
                db(room_code == db.talltales_instances.room_code).delete()
                print("API: Removed user " + str(auth.user.id) + " from game instance " + str(room_code) + ". They were last player, so the gamestate was deleted too.")
                return response.json(dict(
                    successful=True
                ))
            else:
                if auth.user.id == game.hoster:
                    print("API: Hoster is leaving, promoting player " + str(new_player_list[0]) + " to hoster.")
                    db(room_code == db.talltales_instances.room_code).update(hoster=new_player_list[0])
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

#### Delete a game by id.
# incoming packet contents:
#   request.vars.room_code = room code to add to.
# returns:
#   successful = success value.
@auth.requires_signature()
def delete_game_talltales():
    # db(request.vars.room_code == db.talltales_instances.room_code).delete()
    return response.json(dict(
        successful=False
    ))
    
#### Update the vue listing for currently alive games.
# incoming packet contents:
#   request.vars.room_code = room code to add to.
# returns:
#   talltales_games = list of games.
#   successful = success value.
def get_games_talltales():
    #send in 0 for public game, otherwise send something else
    if request.vars.public == '0':
        rows = db(db.talltales_instances.is_public == True).select(db.talltales_instances.ALL, orderby=~db.talltales_instances.created_on)
        print("API: Retrieving public instances of TallTales games.")
    else:
        rows = db().select(db.talltales_instances.ALL)
        print("API: Retrieving all instances of TallTales games.")
    games = []
    for r in rows:
        t = dict(
            room_code = r.room_code,
            player_list = r.player_list,
            hoster = r.hoster,
            max_players = r.max_players,
            turn_time_limit = r.turn_time_limit,
            story_text = r.story_text,
            current_turn = r.current_turn,
            is_public = r.is_public,
            created_on = r.created_on
        )
        print("adding game to list: " + str(t))
        games.append(t)

    return response.json(dict(
        talltales_games=games,
        successful=True
    ))