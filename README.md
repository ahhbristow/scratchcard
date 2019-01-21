


# Example Mapping

This is a web-based version of the "[Example Mapping](https://cucumber.io/blog/2015/12/08/example-mapping-introduction)" technique I learned from a talk Matt Wynne (from the Cucumber team) gave at the Agile Testing & BDD eXchange conference in 2014.  Some colleagues and I introduced this to our [company](www.openbet.com) and it made a big difference to how we went about capturing requirements.  Since we use remote teams, we wanted a web-based tool we could use but couldn't find one that fit our needs, so I decided to develop one instead.  I wanted to learn the NodeJS stack anyway, so it was a nice problem to work on!

# Acknowledgements
Scratchcard is supported by:

<img width="300" src="https://app.scratchcard.io/static/images/browserstack.png" />

BrowserStack gives you instant access to 2000+ real mobile devices and browsers, and is great for testing UI heavy applications such as Scratchcard!


## Install and run locally

To deploy the app, you will need to do the following:


- Install MongoDB using standard package manager
- Install NodeJS using standard package manager (this will install NPM)

~~~
git clone https://github.com/ahhbristow/index_cards
npm install
bower install
~~~

## Deploy as a Docker container

A pre-built Docker image for the cards application is also available in the public Docker registry, and you can start up containers from that image.


### 1.  Start a MongoDB server

~~~
sudo docker pull mongo:latest
sudo docker run --name cards_db -d mongo
~~~

### 2.  Start the NodeJS server in the background (-d option)

~~~
sudo docker pull ahhbristow/index_cards:latest
sudo docker run -d -p 4072:4072 --name cards_app --link cards_db:mongo ahhbristow/index_cards
~~~

You should now be able to access the cards app at:

~~~
http://<docker_host>:4072/
~~~

# DB Dump

To dump the DB, you will need to run the following to get into the container, and do a Mongo export from the default data store:

~~~
sudo docker exec -it cards_db /bin/bash
~~~

# Known Issues
 
- The app currently writes to STDOUT in the container so it won't be possible to debug issues yourself. I'm working on changing the app and container setup for this.
- The app won't reconnect to the DB if it wasn't available at startup.  You must ensure the DB is running before starting the cards_app container.
- There is a silly amount of logging to STDOUT and the browser console at the moment.  May cause a bit of a performance issue.
- THIS IS A BETA VERSION OF THE APP, THERE MAY BE BUGS!
