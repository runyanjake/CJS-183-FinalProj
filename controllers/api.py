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
    print("auth.user.id is " + str(auth.user.id))
    print("API: Creating a new instance of game " + str(request.vars.gametype))
    gametype = int(request.vars.gametype)
    print("gametype is" + str(gametype))

    # generate a unique room code.
    room_id = random.random() * MAX_ROOM_COUNT
    room_code = int(room_id)

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

    print("q is" + str(q))
    matches = db(q).select().first()
    attempts = 0
    while matches is not None and attempts < 1000:
        room_id = random.random() * MAX_ROOM_COUNT  ###### this is a theoretical infinite loop if we get unlucky with random, maybe do a loop if not found?
        room_code = int(room_id)
        matches = db(room_code == db.talltales_instances.room_code).select().first()
        ++attempts

    if attempts != 1000:
        players = []
        current_user = db(int(auth.user.id) == db.user_accounts.user_id).select().first().user_name
        players.append(current_user)
        hoster = current_user
        story_text = []
        story_text.append(request.vars.story_title)
        public = False
        if (request.vars.is_public == 'true' or request.vars.is_public == True):
            public = True
        d = r.insert(
                room_code=room_code,
                is_public=public,
                player_list=players,
                hoster=hoster,
                max_players=request.vars.max_players,
                turn_time_limit=request.vars.turn_time_limit,
                current_turn=current_user,
                timer_time=request.vars.turn_time_limit
            )
        if gametype is 0:
            db(room_code == r.room_code).update(story_text= story_text)

        print("API: Created instance of game " + str(gametype) + " with room_code " + str(room_code))

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

# get_current_user()
# This function is called on loading index.html. If the user got there through a sign-up
# it adds them to the user_accounts table (as opposed to if they got there through a login).
# It returns the logged-in user's user_accounts table entry.
def check_user_accounts():
    if auth.user is not None:
        print("API: Checking for user " + str(auth.user.id) + " in user_accounts.")
        q = auth.user.id == db.user_accounts.user_id
        user = db(q).select().first()
        if user is None:
            print("API: User " + str(auth.user.id) + " is not in user_accounts.")
            return response.json(dict(
                is_in_table=False
            ))
        else:
            print("API: User " + str(auth.user.id) + " is in user_accounts.")
            return response.json(dict(
                is_in_table=True
            ))
    else:
        return response.json(dict(
            is_in_table=False
        ))

@auth.requires_login()
def update_current_user():
    print("API: Updating user " + str(auth.user.id) + " in user_accounts.")
    q = auth.user.id == db.user_accounts.user_id
    match = db(q).select().first()
    if match is None:
        db.user_accounts.insert(
            user_id=int(auth.user.id),
            user_name=request.vars.nickname
        )
        print("API: Inserted " + str(request.vars.nickname) + " into user_accounts.")
    else:
        db(q).update(user_name=request.vars.nickname)
        print("API: Updated name to " + str(request.vars.nickname) + " in user_accounts.")
    
    current_user = db(q).select().first().user_name
    return response.json(dict(
        nickname=current_user
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
    match = db(request.vars.room_code == db.talltales_instances.room_code).select().first()
    current_user = db(auth.user.id == db.user_accounts.user_id).select().first().user_name

    if match is None:
        return response.json(dict(
            successful=False
        ))
    else:
        if current_user != match.current_turn:
            return response.json(dict(
                successful=False
            ))
        else:
            if current_user not in match.player_list:
                return response.json(dict(
                    successful=False
                ))
            else:
                if request.vars.new_text is not None:
                    story = match.story_text
                    story.append(request.vars.new_text + ".")
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

                #Once turn submits, reset timer
                current_user_id = db(auth.user.id == db.user_accounts.user_id).select().first().user_id
                if auth.user.id == current_user_id:
                    db(request.vars.room_code == db.talltales_instances.room_code).update(timer_time=match.turn_time_limit)

                #re-query
                updated_match = db(request.vars.room_code == db.talltales_instances.room_code).select().first()

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
    match = db(request.vars.room_code == db.talltales_instances.room_code).select().first()
    curturn = match.current_turn
    current_user = db(auth.user.id == db.user_accounts.user_id).select().first().user_name
    print("Current turn is " + str(curturn) + " and user is " + str(auth.user.id))
    if curturn == current_user:
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
        db(request.vars.room_code == db.talltales_instances.room_code).update(timer_time=match.turn_time_limit)

        # re-query
        updated_match = db(request.vars.room_code == db.talltales_instances.room_code).select().first()
        return response.json(dict(
            match=updated_match,
            successful=True
        ))
    else:
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

    #The logged in user's queries every second also update the turn time.
    current_user = db(auth.user.id == db.user_accounts.user_id).select().first().user_name
    oldmatch = db(q).select().first()
    if current_user == oldmatch.current_turn and oldmatch.timer_time > 0:
        db(q).update(timer_time=oldmatch.timer_time-1)

        match = db(q).select().first()  # requery after update
        current_user = db(auth.user.id == db.user_accounts.user_id).select().first().user_name
        if match is None or current_user not in match.player_list:
            print("RETURN VIA 1")
            return response.json(dict(
                successful=False
            ))
        else:
            print("RETURN VIA 2")
            #When it's your turn and the timer is counting down
            return response.json(dict(
                gamestate=match,
                successful=True
            ))
    else:
        match = db(request.vars.room_code == db.talltales_instances.room_code).select().first()
        curturn = match.current_turn
        current_user = db(auth.user.id == db.user_accounts.user_id).select().first().user_name
        print("Current turn is " + str(curturn) + " and user is " + str(current_user))
        if curturn == current_user:
            print("ITS MY TURN AND IM GONNA SKIP")
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
            print("Old Turn: " + str(old_turn) + "    New turn: " + str(new_turn))
            db(request.vars.room_code == db.talltales_instances.room_code).update(current_turn=new_turn)
            db(request.vars.room_code == db.talltales_instances.room_code).update(timer_time=match.turn_time_limit)

            # re-query
            updated_match = db(request.vars.room_code == db.talltales_instances.room_code).select().first()
            print("NEW MATCH STATE: " + str(updated_match))
            print("RETURN VIA 3")
            #when you're skipping your turn
            return response.json(dict(
                gamestate=updated_match,
                successful=True
            ))
        else:
            print("RETURN VIA 4")
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
    current_user = db(auth.user.id == db.user_accounts.user_id).select().first().user_name

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
        if current_user in player_list:
            print("API: User " + str(current_user) + " is already in game instance " + str(room_code))
            return response.json(dict(
                successful=False
            ))
        else:
            player_list.append(current_user)
            db(q).update(player_list=player_list)
            print("API: Added user " + str(current_user) + " to game instance " + str(room_code) + " (type " + str(gametype) + ")")
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
    current_user = db(int(auth.user.id) == db.user_accounts.user_id).select().first().user_name

    if gametype is 0:
        q = room_code == db.talltales_instances.room_code

    elif gametype is 1:
        q = room_code == db.taboo_instances.room_code

    else:
        q = room_code == db.typeracer_instances.room_code

    room = db(q).select().first()
    if room is not None:
        player_list = room.player_list
        if current_user not in player_list:
            print("API: User " + str(current_user) + " was not in game instance " + str(room_code) + ".")
            return response.json(dict(
                successful=False
            ))
        else:
            new_player_list = []
            for player in player_list:
                if current_user != player:
                    new_player_list.append(player)
            if new_player_list == []:
                db(q).delete()
                print("API: Removed user " + str(current_user) + " from game instance " + str(room_code) + ". They were last player, so the game was deleted too.")
                return response.json(dict(
                    successful=True
                ))
            else:
                if current_user == room.hoster:
                    print("API: Hoster is leaving, promoting player " + str(new_player_list[0]) + " to hoster.")
                    db(q).update(hoster=new_player_list[0])

                    match = db(request.vars.room_code == db.talltales_instances.room_code).select().first()
                    db(request.vars.room_code == db.talltales_instances.room_code).update(timer_time=match.turn_time_limit)

                if current_user == room.current_turn:
                    #update the turn if it's the person who's leaving's turn.
                    old_turn = room.current_turn
                    new_turn = room.player_list[0]
                    is_next = False
                    for player in player_list:
                        if is_next == True:
                            new_turn = player
                            is_next = False
                        if player == old_turn:
                            is_next = True
                    db(q).update(current_turn=new_turn)
                    print("API: Current turn's player leaving, passing turn to " + str(new_turn) + ".")


                db(q).update(player_list=new_player_list)
                print("API: Removed user " + str(current_user) + " from game instance " + str(room_code) + ".")
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
#   request.vars.gametype = game type to look for.
# returns:
#   public_games = list of games.
#   successful = success value.

def get_games():
    gametype = int(request.vars.gametype)
    print("API: Retrieving public instances of game type" + str(gametype))
    games = []

    if gametype is 0:
        q = db.talltales_instances
        rows = db(q).select()
        for game in rows:
            t = dict(
                room_code = game.room_code,
                player_list = game.player_list,
                hoster = game.hoster,
                max_players = game.max_players,
                turn_time_limit = game.turn_time_limit,
                story_text = game.story_text,
                current_turn = game.current_turn,
                is_public = game.is_public,
                created_on = game.created_on,
                timer_time = game.timer_time
            )
        games.append(t)

    elif gametype is 1:
        q = db.taboo_instances
        rows = db(q).select()
        for game in rows:
            t = dict(
                room_code = game.room_code,
                player_list = game.player_list,
                hoster = game.hoster,
                max_players = game.max_players,
                turn_time_limit = game.turn_time_limit,
                current_turn = game.current_turn,
                is_public = game.is_public,
                created_on = game.created_on,
                taboo_word_row_id=game.taboo_word_row_id,
                #player_scores=player_scores,
                timer_time = game.timer_time
            )
        games.append(t)

    else:
        r = db.typeracer_instances

    return response.json(dict(
        public_games=games,
        successful=True
    ))

#### Fetches nickname for a logged in user
# incoming packet contents: 
#   none
# returns:
#   current_user = nickname of current user
#   nickname_logged_in = boolean of logged in or not, used to tell js whether or not to display greeting message
#   successful = success value
def get_nickname():
    print("Fetching the nickname for the currently logged in user")
    if auth.user is not None:
        print("auth.user is not none")
        current_user = db(int(auth.user.id) == db.user_accounts.user_id).select().first().user_name
        print(current_user)
        nickname_logged_in = True
        successful = True
    else:
        print("auth.user is none")
        current_user = None
        nickname_logged_in = False
        successful = False
    
    return response.json(dict(
        current_user=current_user,
        nickname_logged_in=nickname_logged_in,
        successful=successful
    ))