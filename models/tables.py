# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.
# http://www.web2pyref.com/reference/field-type-database-field-types
# http://www.web2py.com/books/default/chapter/29/06/the-database-abstraction-layer @ field constructor

import datetime

def get_user_email():
    return auth.user.email if auth.user is not None else None

db.define_table('user_accounts',
                Field('user_id', 'integer', 'references auth_user', default=auth.user.id if auth.user is not None else None), 
                Field('user_name', 'string', default="Guest"),
                Field('theme', 'integer', default=5)
                )
                #This is barebones, can add more customization stuff
                #auth.user is static so no email/password required

db.define_table('typeracer_prompts',
                Field('prompt', 'text', required=True)
                )

db.define_table('taboo_words',
                Field('word', 'string', required=True),
                Field('banned_words', 'list:string', default=[])
                )

db.define_table('talltales_instances', #Tall Tales
                #default game attributes
                Field('room_code', 'text', default = ''),
                Field('is_public', 'boolean', default=True),
                Field('player_list', 'list:string', 'references user_accounts', default=None), #ref user id's
                Field('hoster', 'string', 'references user_accounts', default=auth.user.id if auth.user is not None else None),
                Field('max_players', 'integer', default=10),
                Field('turn_time_limit', 'integer', default=30),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                Field('timer_time', 'integer', default=0),
                #game specific attributes
                Field('story_text', 'list:string', default=[]),
                Field('current_turn', 'string', 'references user_accounts')
                )

db.define_table('typeracer_instances', #Type Racer
                #default game attributes
                Field('room_code', 'text', default = ''),
                Field('player_list', 'list:integer', 'references auth_user', default=[]), #ref user id's
                Field('hoster', 'references auth_user', required=True),
                Field('max_players', 'integer', default=10),
                Field('turn_time_limit', 'integer', default=30),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                #game specific attributes
                Field('prompt', 'text', 'references typeracer_prompts.prompt'),
                Field('player_seedings', 'list:integer', default=[])
                )

db.define_table('taboo_instances', #Taboo
                #default game attributes
                Field('room_code', 'string', default = ''),
                Field('is_public', 'boolean', default=True),
                Field('player_list', 'list:integer', 'references auth_user', default=[]),  #, 'references users'
                Field('hoster', 'string', 'references auth_user', required=True),
                Field('max_players', 'integer', default=10),
                Field('turn_time_limit', 'integer', default=30),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                #game specific attributes
                #NOTE: This did not work until we erased 'string', replaced it with 'integer', then re replaced it with 'string'
                Field('taboo_word_row_id', 'integer', 'references taboo_words'),
                Field('player_scores', 'list:integer', default=[])
                )


# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
