CREATE TABLE IF NOT EXISTS GAME (
    GAME_ID SERIAL PRIMARY KEY,
    CURRENTLEVEL INTEGER NOT NULL,
    DISCOVEREDANIMALS INTEGER NOT NULL,
    COINS INTEGER NOT NULL,
    FRUITS INTEGER NOT NULL,
    MAXCOINS INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS USERS (
    GAME_ID INTEGER NOT NULL,
    NAME VARCHAR PRIMARY KEY,
    PASSWORD VARCHAR NOT NULL,
    CONSTRAINT FK_GAME FOREIGN KEY(GAME_ID) REFERENCES GAME(GAME_ID)
);
INSERT INTO GAME (CURRENTLEVEL,DISCOVEREDANIMALS,COINS,FRUITS,MAXCOINS) VALUES (1,1,0,0,0);
INSERT INTO USERS (GAME_ID,NAME,PASSWORD) VALUES (1,'laura','12345');