# RDocumentation API

_Important notes:_

1. Please read this [confluence page](https://datacamp.atlassian.net/wiki/spaces/PRODENG/pages/2314469377/RDocumentation) which explains the architecture of how RDocumentation works.
2. This repo is now only used for its API. Please disregard all the UI code here. THe UI now lives in [datacamp/rdocumentation-2.0](https://github.com/datacamp/rdocumentation-2.0).

rdocumentation.org provides the R community with centralized, quality and easy to search documentation.

R documentation sifts through all CRAN, GitHub and BioConductor packages hourly, parses the documentation files and indexes them in an Elasticsearch database. This makes rdocumentation.org the best online resource to browse all R package documentation.

## How the API works

You can check docs for the API by running the app locally and going to http://localhost:3000/docs/

1. Newly parsed packages are added to the `rdocs-app-worker` SQS queue every hour.
2. That queue is configured to hit the `/task` path which calls the `processMessage` method of the WorkerController
3. That `processMessage` method adds topics to the mysql database
4. After a query is sent to the API to request a topic, that topic is stored in Redis so that it's returned faster next time.

## Development

### Using docker

You'll need docker and docker-compose to run this stack locally

- Copy the .env.sample to .env and change relevant variables
  - If you already have a mysql db running on port 3306, update the `DATABASE_PORT` to another value
- `docker-compose create` to create the redis and mysql container
- `docker-compose start` to fire up a local redis an mysql
- Use the same node version in your terminal as the Dockerfile is using: `nvm use 8.16`
- `npm install`
- Run the database migrations by doing `npm run migrate`
- `npm run start-dev`

### Troubleshooting

If you get an error: `SequelizeConnectionError: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client`
follow these steps:

1. Access your mysql container: you can do it either through the docker app by clicking on the "cli" button of the container, or in your terminal by running `docker exec -it <mysql_container_id> bash`
2. `mysql -u root -p`
3. Enter: `password`
4. `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'`

## How to deploy

- To deploy to stating (rdocumentation.datacamp-staging.com), merge to master
- To deploy to production, add a tag which starts with `release-`

The rdocumentation app is hosted on DataCamp's infrastructure, on our AWS ECS cluster.

## What the CI does

This application runs on the DataCamp infrastructure. Our custom CI flow will:

- Build a docker image
- Upload it the ECR
- Deploy the new version to ECS

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
