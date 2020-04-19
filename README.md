# Description
In this project we implement an application to create, update and query [ECG balance sheets](https://www.ecogood.org/en/our-work/common-good-balance-sheet/).
At the moment a balance sheet consists of two files. One is the [common good report](https://www.ecogood.org/media/filer_public/93/5e/935e2c4e-8d87-44b3-afce-70818212bcc3/full-report-template.docx)
and the other one is an [Excel file](https://www.ecogood.org/media/filer_public/88/3e/883e7106-2aaa-493c-af80-89bbd38c65fd/gwb-rechner_5_0_2_vollbilanz.xlsx)
which contains all the calculations. Our application focuses on the calculation part.
The aim is to provide an application programming interface (API) which takes over
the calculations of the Excel file and stores the results in a database so that they
are available for other services.
# Technology used
Our application uses the [nodejs JavaScript runtime](https://nodejs.org/en/).
For type safety it is written in [typescript](https://www.typescriptlang.org/).
The API is based upon [GraphQL](https://graphql.org/). 
The balance sheets with their calculations results are stored in 
[Mongo database](https://www.mongodb.com/).     
# Local Development
## Run mongo database
To run the database you can run the following command:
```shell script
docker docker-compose up
```
It starts a mongo database in a docker container which is listening to
the port 27017. 

## Run application
First you have to install all dependicies via:
```shell script
npm install
```
Afterwards you have to copy the .env-cmdrc.template.json file
 and rename it to *.env-cmdrc.json*. This file holds the configuration 
for the application. Just replace the *applicationuser* and
*applicationpwd* by your preferred user and password. 
These credentials are used to secure the application. If you want to run the
application on a different port just replace the *9001* by the your port.
```json
{
  "development": {
    "USER": "applicationuser",
    "PASS": "applicationpwd",
    "PORT": 9001,
    "DB_URL": "mongodb://localhost:27017/BalanceSheet"
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

