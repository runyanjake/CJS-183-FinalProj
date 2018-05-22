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

db.define_table('users',
                Field('user_email', default=get_user_email()),
                Field('username', 'text', required=True),
                Field('password', 'text', required=True),
                Field('account_creation_date', 'date', update=datetime.date.today())
                )

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
                Field('player_list', 'list:integer', 'references users'), #ref user id's
                Field('hoster', 'references users', required=True),
                Field('max_players', 'integer', default=10),
                Field('turn_time_limit', 'integer', default=30),
                #game specific attributes
                Field('story_text', 'list:string', default=[])
                )

db.define_table('typeracer_instances', #Type Racer
                #default game attributes
                Field('room_code', 'text', default = ''),
                Field('player_list', 'list:integer', 'references users'), #ref user id's
                Field('hoster', 'references users', required=True),
                Field('max_players', 'integer', default=10),
                Field('turn_time_limit', 'integer', default=30),
                #game specific attributes
                Field('prompt', 'references typeracer_prompts'),
                Field('player_seedings', 'list:integer', default=[])
                )

db.define_table('taboo_instances', #Taboo
                #default game attributes
                Field('room_code', 'string', default = ''),
                Field('player_list', 'list:integer'),  #, 'references users'
                Field('hoster', 'references users', required=True),
                Field('max_players', 'integer', default=10),
                Field('turn_time_limit', 'integer', default=30),
                #game specific attributes
                Field('secret_word', 'string'),  #, 'references taboo_words'
                Field('player_scores', 'list:integer', default=[])
                )


# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
