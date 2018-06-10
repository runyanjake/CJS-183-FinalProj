# Here go your api methods.

# import uuid
import random

## The max number of unique rooms that can exist in the database.
MAX_ROOM_COUNT = 999999

########################################################################
######################## TALL TALES API METHODS ########################
########################################################################

#### Initializes a new instance of a game.
# incoming packet contents:
#   request.vars.gametype = which of the three games will be created:
#       - 0 is talltales, 1 is taboo, 2 is typeracer
#   request.vars.is_public = is game public?.
#   request.vars.max_players = max number of players in the game.
#   request.vars.turn_time_limit = length of a turn in seconds.
#   request.vars.story_title = title of the story (for talltales)
# returns:
#   room_code = new room's code.
#   successful = success value.

@auth.requires_login()
def initialize():
    print("API: Creating a new instance of game " + str(request.vars.gametype))
    gametype = int(request.vars.gametype)

    # generate a unique room code.
    id = random.random() * MAX_ROOM_COUNT
    room_code = int(id)

    # determine which game type to find a valid code for
    if gametype is 0:
        q = room_code == db.talltales_instances.room_code
        r = db.talltales_instances

    elif gametype is 1:
        q = room_code == db.taboo_instances.room_code
        r = db.taboo_instances

    else:
        q = room_code == db.typeracer_instances.room_code
        r = db.typeracer_instances

    matches = db(q).select().first()
    attempts = 0
    while matches is not None and attempts < 1000:
        id = random.random() * MAX_ROOM_COUNT  ###### this is a theoretical infinite loop if we get unlucky with random, maybe do a loop if not found?
        room_code = int(id)
        matches = db(room_code == db.talltales_instances.room_code).select().first()
        ++attempts

    if attempts != 1000:
        players = []
        players.append(auth.user.id)
        hoster = auth.user.id
        story_text = []
        story_text.append(request.vars.story_title)
        public = False
        if (request.vars.is_public == 'true' or request.vars.is_public == True):
            public = True
        r.insert(
                room_code=room_code,
                is_public=public,
                player_list=players,
                hoster=hoster,
                max_players=request.vars.max_players,
                turn_time_limit=request.vars.turn_time_limit
            )
        if gametype is 0:
            db(room_code == r.room_code).update(story_text= story_text)
        print("API: Created instance of game " + str(request.vars.gametype) + " with room_code " + str(room_code))

        newroom = db(q).select().first()
        return response.json(dict(
            successful=True,
            gamestate = newroom,
            room_code=room_code,
            gametype=gametype
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
#   (Leave a value blank if you don't want it to update.)
# returns:
#   successful = success value.
@auth.requires_login()
def take_turn_talltales():
    print("API: Updating Talltales gamestate " + str(request.vars.room_code) + ".")
    match = db(request.vars.room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    print("match.current_turn is " + str(match.current_turn) + ".")
    print("auth.user.id is " + str(auth.user.id) + ".")
    if match is None:
        return response.json(dict(
            successful=False
        ))
    else:
        if auth.user.id != match.current_turn:
            print("Not ur turn")
            return response.json(dict(
                successful=False
            ))
        else:
            if auth.user.id not in match.player_list:
                return response.json(dict(
                    successful=False
                ))
            else:
                if request.vars.new_text is not None:
                    story = match.story_text
                    story.append(request.vars.new_text)
                    db(request.vars.room_code == db.talltales_instances.room_code).update(story_text=story)

                #Always update turn, allows us to skip turns on timeout.
                old_turn = match.current_turn
                new_turn = match.player_list[0]
                is_next = False
                for player in match.player_list:
                    if is_next == True:
                        new_turn = player
                        is_next = False
                    if player == old_turn:
                        is_next = True
                db(request.vars.room_code == db.talltales_instances.room_code).update(current_turn=new_turn)

                #re-query
                updated_match = db(request.vars.room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
                return response.json(dict(
                    match=updated_match,
                    successful=True
                ))

#### Attempts to timeout a user from their turn if they are past their time.
# incoming packet contents
#   request.vars.room_code = room code to add to.
# returns:
#   successful = success value.
@auth.requires_login()
def timeout_turn_talltales():
    match = db(request.vars.room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
    curturn = match.current_turn
    print("Current turn is " + str(curturn) + " and user is " + str(auth.user.id))
    if curturn == auth.user.id:
        print("\n\n\nThis user's turn should be skipped.")
        # Always update turn, allows us to skip turns on timeout.
        old_turn = match.current_turn
        new_turn = match.player_list[0]
        is_next = False
        for player in match.player_list:
            if is_next == True:
                new_turn = player
                is_next = False
            if player == old_turn:
                is_next = True
        db(request.vars.room_code == db.talltales_instances.room_code).update(current_turn=new_turn)

        # re-query
        updated_match = db(request.vars.room_code == db.talltales_instances.room_code).select(db.talltales_instances.ALL).first()
        return response.json(dict(
            match=updated_match,
            successful=True
        ))
    else:
        print("this users turn should NOT be skipped.")
        return response.json(dict(
            successful=False
        ))

#### Returns the most recent database version of the gamestate for re-rendering the webpage periodically.
# incoming packet contents:
#   request.vars.room_code = room code to get gamestate
# returns:
#   match = the match (a row) containing gamestate info
#   successful = success value.
@auth.requires_login()
def get_gamestate():
    gametype = int(request.vars.gametype)
    room_code = request.vars.room_code
    print("API: Retrieving gamestate of room " + str(request.vars.room_code) + " (type " + str(gametype) + ").")
    if gametype is 0:
        q = room_code == db.talltales_instances.room_code

    elif gametype is 1:
        q = room_code == db.taboo_instances.room_code

    else:
        q = room_code == db.typeracer_instances.room_code

    match = db(q).select().first()
    if match is None or auth.user.id not in match.player_list:
        return response.json(dict(
            successful=False
        ))
    else:
        return response.json(dict(
            gamestate=match,
            successful=True
        ))

#### Add this user to an existing instance of the game.
# incoming packet contents:
#   request.vars.room_code = room code to add to.
# returns:
#   successful = success value.
@auth.requires_login()
def add_player():
    gametype = int(request.vars.gametype)
    print("API: Attempting to add player to existing instance of game type " + str(gametype))
    room_code = request.vars.room_code

    if gametype is 0:
        q = room_code == db.talltales_instances.room_code

    elif gametype is 1:
        q = room_code == db.taboo_instances.room_code

    else:
        q = room_code == db.typeracer_instances.room_code

    room = db(q).select().first()
    print("API: auth.user.id is " + str(auth.user.id) + " on JOINING of game.\n")
    if room is not None:
        player_list = room.player_list
        if auth.user.id in player_list:
            print("API: User " + str(auth.user.id) + " is already in game instance " + str(room_code))
            return response.json(dict(
                successful=False
            ))
        else:
            player_list.append(auth.user.id)
            db(q).update(player_list=player_list)
            print("API: Added user " + str(auth.user.id) + " to game instance " + str(room_code) + " (type " + str(gametype) + ")")
            newroom = db(q).select().first()
            return response.json(dict(
                gamestate=newroom,
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
def remove_player():
    gametype = int(request.vars.gametype)
    print("API: Attempting to remove player from existing instance of game type " + str(gametype))
    room_code = request.vars.room_code

    if gametype is 0:
        q = room_code == db.talltales_instances.room_code

    elif gametype is 1:
        q = room_code == db.taboo_instances.room_code

    else:
        q = room_code == db.typeracer_instances.room_code

    room = db(q).select().first()
    if room is not None:
        player_list = room.player_list
        if auth.user.id not in player_list:
            print("API: User " + str(auth.user.id) + " was not in game instance " + str(room_code) + ".")
            return response.json(dict(
                successful=False
            ))
        else:
            new_player_list = []
            for player_id in player_list:
                if auth.user.id != player_id:
                    new_player_list.append(player_id)
            if new_player_list == []:
                db(q).delete()
                print("API: Removed user " + str(auth.user.id) + " from game instance " + str(room_code) + ". They were last player, so the gamestate was deleted too.")
                return response.json(dict(
                    successful=True
                ))
            else:
                if auth.user.id == room.hoster:
                    print("API: Hoster is leaving, promoting player " + str(new_player_list[0]) + " to hoster.")
                    db(q).update(hoster=new_player_list[0])

                if auth.user.id == room.current_turn:
                    #update the turn if it's the person who's leaving's turn.
                    old_turn = room.current_turn
                    new_turn = room.player_list[0]
                    is_next = False
                    for player in player_list:
                        if is_next == True:
                            new_turn = player
                            is_next == False
                        if player == old_turn:
                            is_next = True
                    db(q).update(current_turn=new_turn)
                    print("API: Current turn's player leaving, passing turn to " + str(new_turn) + ".")


                db(q).update(player_list=new_player_list)
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
        public_games=games,
        successful=True
    ))