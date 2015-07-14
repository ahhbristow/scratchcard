# index_cards


# Deploy manually

To deploy the app, you will need to do the following:


- Install MongoDB using standard package manager
- Install NodeJS using standard package manager (this will install NPM)


- git clone https://github.com/ahhbristow/index_cards
- npm install
- bower install


# Run with Docker

A pre-built Docker image for the cards application is also available, and you can start up containers from that image.


# 1.  Start a MongoDB server
sudo docker pull mongo:latest
sudo docker run --name cards_db -d mongo


# 2.  Start the NodeJS server in the background (-d option)
sudo docker pull [DOCKER_REGISTRY]/cards_server
sudo docker run -d -p 4072:4072 --name cards_app --link cards_db:mongo [DOCKER_REGISTRY]/sbristow/cards_server

You should now be able to access the cards app at:

http://localhost:4072/


# DB Dump
To dump the DB, you will need to run the following to get into the container, and do a Mongo export from the default data store:

sudo docker exec -it cards_db /bin/bash


# Known Issues
 
- The app currently writes to STDOUT in the container so it won't be possible to debug issues yourself. I'm working on changing the app and container setup for this.
- The app won't reconnect to the DB if it wasn't available at startup.  You must ensure the DB is running before starting the cards_app container.
- There is a silly amount of logging to STDOUT and the browser console at the moment.  May cause a bit of a performance issue.
- THIS IS A BETA VERSION OF THE APP, THERE MAY BE BUGS!
