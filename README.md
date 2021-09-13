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

## API Arquitecture

Built for a modern, scalable, and flexible monolithic api arquitecture in mind. This demo project should pave a way for fast development with a possibility of migrating to other arquitecture solutions, such as microservices.

Layers:

- Controllers
- Middleware
- Services
- Models
- Repositories
- Providers

### Definitions

- DAO (Data access object): responsible for connecting with the db
- DTO (Data transfer object): object responsible for data transmission

## Project Structure

All files must be lowercased and separated by a '-'

```bash
├──src
│   ├──db
│   │   ├──mongoose-connection.ts
│   ├──errors
│   │   ├──mongo-connection-error.ts
│   ├──providers
│   │   ├──logger.ts
│   ├──config.ts
│   ├──server.ts
```

## Notes

Its a best practice to run a single process per docker container, this is why pm2 its not going to be used for running node in prod. The node docker image should handle failures, gracefully shutdown, and then restart. Also some cloud service providers can handle when a container goes down and perform actions.

Locally mongo is run with docker-compose, in prod a cloud mongo service should be used, such as mongo atlas.

Mongoose was chosen above other ORMs because of its specialization in mongo.

DON'T run the server using npm scripts as these have been found to produce weird errors, such as double exit signals, read more [here](https://lisk.com/blog/development/why-we-stopped-using-npm-start-child-processes)

It's not recommended to set secrets (auth, keys, etc) through env variables, as those could be inspected by an intruder if they obtain access to the running process host or container
