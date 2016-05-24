# Cerberus - UX #

## Summary ##

This project, introduced by OVH, aims to help ISP managing abuses
on their network by providing a complete toolsuite such as an email parser,
an email topic detection system, a ticketing system, an API and an UX.

This project comes in addition of [cerberus-core](https://github.com/ovh/cerberus-core/)
which provides the backend API.

## Getting Started ##

### TL;DR ###

You're in a hurry and you only want to give the application a whirl? Why not 
running the provided docker image?

- Checkout the code and download the zipfile.
- If not already done, install docker by following this nice [guide](https://docs.docker.com/engine/installation/)
- Build the image by running `docker build -t cerberus <dockerfile-path>`
- Install an email server (postfix, or whatever). If you don't, you also can
use an already running MX such your personnal MX.
- Run the image providing your MX information so the app can poll the mails
`docker run -e EMAIL_HOST=mx.domain.com -e EMAIL_PORT=993 -e
EMAIL_LOGIN=login@domain.com -e EMAIL_PASS=pass -p 6060:6060 -t cerberus`

If you followed all these steps, congratulations ! You can now browse the app
by entering URI `http://127.0.0.1:6060` and login using default login
*admin:admin*.

If you want to know how it does work, read the next sections.

*Important note: no data persistence provided since it remains a docker.*

![cerberus](https://raw.githubusercontent.com/ovh/cerberus-core/devel/doc/source/cerberus.gif?token=AQVCyzi29XLlKOim8_VoCJjYEWyoY1Gaks5Wx0qqwA%3D%3D)

### Prerequisites ###

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.4, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)


### Installation ###

To run the app in production, follow these few steps:

1. Check out the code or download the zipfile.
2. Run `make install` to install the dependencies.
3. Run `make build` to build the app.
4. Copy all the content of `dist/client` (even hidden files) in your `www`.
5. Celebrate.

## Concept ##

### Plaintiff ###

(Law) A a person who brings a civil action in a court (aka claimant).

### Defendant ###

(Law) A person or entity against whom an action or claim is brought in a court
of law. It is one of your customer who is suspected of illegal activities on
his service(s).

### Service ###

A Defendant has suscribed to one or more services(s) (product(s)) your company
offers. It can be xDSL, hosting, email services ...

### Provider ###

The source of the email. It can be direclty the plaintiff or an representative
third party.

### Report ###

One Provider + one Category. If a defendant is identified, the report is linked
to a defendant, a service and contains item(s).

### Ticket ###

One or more reports + one Category. It might be linked to a defendant/service,
so all reports themselves linked to this defendant/service.

### Item ###
        
Fraudulent item found in an email.

### Action ###

An action on a customer's service (suspend, shutdown, breach of contract).

## Going further ##

Get a look at the API which might provide more information about the workflow:
[cerberus-core](https://github.com/ovh/cerberus-core/blob/master/README.md)

