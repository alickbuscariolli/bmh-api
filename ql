                                   Table "public.users"
   Column    |         Type          |                     Modifiers                      
-------------+-----------------------+----------------------------------------------------
 id          | integer               | not null default nextval('users_id_seq'::regclass)
 email       | text                  | 
 password    | text                  | not null
 fullname    | character varying(50) | not null
 dateofbirth | date                  | 
 rating      | numeric               | 
 gender      | character varying(6)  | 
 premium     | boolean               | 
 created_at  | date                  | 
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
Referenced by:
    TABLE "items" CONSTRAINT "user_id_fkey" FOREIGN KEY (user_id_fkey) REFERENCES users(id)

