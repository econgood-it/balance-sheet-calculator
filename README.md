# Install node

```shell script
sudo apt install nodejs
sudo apt install npm
```

# Update node to current version

```
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
```

# Install docker and docker-compose
```
sudo snap install docker
sudo apt  install docker-compose
sudo groupadd docker
sudo usermod -aG docker $USER
```

# Description

At the moment a [ECG balance sheet](https://www.ecogood.org/en/our-work/common-good-balance-sheet/) consists of two files. One is the [common good report](https://www.ecogood.org/media/filer_public/93/5e/935e2c4e-8d87-44b3-afce-70818212bcc3/full-report-template.docx)
and the other one is an [Excel file](https://www.ecogood.org/media/filer_public/88/3e/883e7106-2aaa-493c-af80-89bbd38c65fd/gwb-rechner_5_0_2_vollbilanz.xlsx)
which contains all the calculations. Our application focuses on the calculation part.
The aim is to provide an application programming interface (API) which takes over the calculations of the Excel file.

# Technology used

Our application uses the [nodejs JavaScript runtime](https://nodejs.org/en/).
For type safety it is written in [typescript](https://www.typescriptlang.org/).

# Local Development

## Run database
Our application uses a postgresql database to store the data. To run the database locally, you can use
the docker-compose.yml file. If docker-compose is not installed yet see [the installation guide](#Install docker and docker-compose).

```shell script
docker-compose -f docker-compose.yml up
```

## Run application

If no database is running follow the steps of [Run Database](#Run database).

First you have to install all dependicies via:

```shell script
npm install
```

Afterwards you have to create in the root directory a file _.env-cmdrc.json_. This file holds the configuration
for the application. Just replace the _applicationuser_ and
_applicationpwd_ by your preferred user and password.
These credentials are used to secure the application. If you want to run the
application on a different port just replace the _4000_ by the your port.

```json
{
  "development": {
    "DB_NAME": "balancesheet",
    "DB_HOST": "localhost",
    "DB_PORT": 5433,
    "DB_USER": "postgres",
    "DB_PASSWORD": "oKLyNUr2doEBlMup47ii",
    "ENVIRONMENT": "DEV",
    "ADMIN_EMAIL": "adminuser",
    "ADMIN_PASSWORD": "adminpwd",
    "DOCS_USER": "docsuser",
    "DOCS_PASSWORD": "docspwd",
    "JWT_SECRET": "6,AfDvPl<#{qPYu?-~",
    "PORT": 4000,
    "WORKBOOK_API_TOKEN": "apitoken"
  }
}
```

After creating the configuration file from above we are now ready to run the nodejs application.
Therefore, you have to execute the npm command below in a terminal:

```shell script
npm run start
```

It reads the configuration file and starts the application in watch mode.
That means, it automatically detects code changes and reloads the application.
So when making code changes you do not have to stop and restart the application by hand.

## Run tests

To run the test suites, you have to execute the npm command below in a terminal:

```shell script
npm run test
```

The tests run in watch mode. That means, it automatically detects code changes and re-executes the tests.

## Migrations

The migrations for the database are located at the src/migrations folder.
All migrations' file names are following the naming convention:
EPOCHMILLISECONDS-DescriptionOfWhatTheMigrationDoes
On linux systems you can retrieve the EPOCHMILLISECONDS via

```shell script
date +%s%300
```

# Deployments

To deploy the application use the docker commands explained below:

```
docker build -t deployment_server . -f Dockerfile_Deployment && docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker -v ~/.ssh:/root/.ssh:ro -e ENVIRONMENT=test deployment_server
```

