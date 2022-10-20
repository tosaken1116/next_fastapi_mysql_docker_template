# Web Development Template

This is the template we use for web development.

## Pull Repository

`git clone git@github.com:tosaken1116/next_fastapi_mysql_docker_template.git`

## Getting Started

First, rename .env:

```
mv .env.sample .env
```

Second, edit `.env`file to determine database environment variables:

Third, run the development server:

```
docker-compose up --build
```

After the second time, `--build` is not necessary

## Open Localhost

-   Open["http://localhost:3000"](http://localhost:3000) with your browser when you want to see the front_end result

-   Open["http://localhost:8000"](http://localhost:8000) with your browser when you want to see the fastapi result

## Stop the development server:

Use`docker-compose down`
