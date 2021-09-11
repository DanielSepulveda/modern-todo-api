# README

## Tools

- Node.js
- Typescript
- Express
- Mongo
- Docker & docker-compose
- Nodemon
- Pino
- Morgan
- Mongoose

## Notes

Its a best practice to run a single process per docker container, this is why pm2 its not going to be used for running node in prod. The node docker image should handle failures, gracefully shutdown, and then restart. Also some cloud service providers can handle when a container goes down and perform actions.

Locally mongo is run with docker-compose, in prod a cloud mongo service should be used, such as mongo atlas.

Mongoose was chosen above other ORMs because of its specialization in mongo.
