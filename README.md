Home Automation Example App
==================

This application is written as a React app with Murano Solution event handlers, routes, modules and static assets.


Using This Example
------------------

Clone this repository.

```
git clone git@github.com:exosite/home-automation-example.git
cd home-automation-example
```

To deploy the application, first install the [exosite command line tool](http://beta-docs.exosite.com/murano/exosite-cli/). Then initialize the project with your solution and product id using the `--init` option and deploy with `--deploy`.

To build the application, install build tools using `npm install`. The minimum node version we're supporting is 0.12.x.  If you have a lower version you'll encounter errors while running `npm install`.

After installing the packages, compile the application.

```
npm run compile
```

To run the web application static assets locally, create a .env file in the root of the project with your solution URL, like this:

```
API_BASE_URL=https://<solution-name>.apps.exosite.io
```

Then run this and go to http://localhost:8080 in your browser.

```
npm run start:dev
```
