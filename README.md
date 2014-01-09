Check out this git project into your development directory:

- Go into the "expressapp" subdirectory.
- Type: `npm install`

Install MySQL:

    sudo apt-get install mysql-server

To run:

- Go into the "expressapp" subdirectory.
- The listening port, if not provided, defaults to 3000.  Type: `[env PORT=<some port num>] node app`

URL routes:

About handlebar templates:

- expressapp/views/layouts/main.handlebars: This is the main template, which acts as the base for all templates.
- expressapp/views/home.handlebars: This is the template for the landing page.  Its contents are inserted into the body of the main template.  