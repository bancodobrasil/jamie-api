# Jamie API

## Description

This project is developed using the [Nest](https://github.com/nestjs/nest) framework.

## Dependencies

To run the Jamie API project on your machine, you need to set up some dependencies. Make sure you have the following prerequisites:

- [Node](https://nodejs.org/en)
- [npm](https://www.npmjs.com/)
- [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/)

## Installation

Open the terminal in the Jamie API project directory and type:

```bash
yarn
```

Then, run the Docker command:

```bash
docker compose up -d
```

### Environment Configuration

Next, make a copy of the `.env.development` file, renaming it to just `.env`. You will need to configure the `KEYCLOAK_SECRET` variable. To do this, you'll need to download the [jamie-ui](https://github.com/bancodobrasil/jamie-ui) project and follow the instructions in its README.

Once you've completed all the KeyCloak configuration, change the **Realm** to `jamie` and click on the **Clients** menu on the side. Then, in the **Client ID** column, click on `jamie-api`. This will open a screen similar to the following:

![Secret KeyCloak](img/secret.png)

Click on **Credentials**, where you will find a key under **Client secret**. Copy this key and paste it into the `KEYCLOAK_SECRET` variable in the `.env` file:

```bash
KEYCLOAK_SECRET=Secret
```