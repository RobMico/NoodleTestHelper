CREATE TABLE NoodleTests(QuestionText text, Answer text, Comment text, rating int, courseId int, testId int)
CREATE TABLE LoginInfo(username text, password text)
ALTER TABLE LoginInfo ADD CONSTRAINT constraint1 UNIQUE (username);
ALTER TABLE NoodleTests ADD CONSTRAINT constraint2 UNIQUE (QuestionText);