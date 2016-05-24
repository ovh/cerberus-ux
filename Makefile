NPM=npm
GRUNT=grunt
BOWER=bower
GIT=git
MAKE=make
CD=cd
TAR=tar -zcvf
TAR_NAME=dist.tar.gz
NODE_DIR=node_modules
GRUNT_DEP=$(NODE_DIR)/grunt
DIST_DIR=dist
BOWER_DIR=client/bower_components
DEL=rm -rf
ECHO=@echo
VERSION=`grep -Po '(?<="version": ")[^"]*' package.json`

help:
	$(ECHO) "_____________________________"
	$(ECHO) "Current version is $(VERSION)"
	$(ECHO) "_____________________________"
	$(ECHO) " -- AVAILABLE TARGETS --"
	$(ECHO) "make clean                           => clean the sources"
	$(ECHO) "make install                         => install deps"
	$(ECHO) "make dev                             => launch the project (development)"
	$(ECHO) "make test                            => launch the tests"
	$(ECHO) "make version                         => get the current version"
	$(ECHO) "make build                           => build the project and generate build folder"
	$(ECHO) "make release type=patch|minor|major  => build the project, generate build folder, increment release and commit the source"
	$(ECHO) "_____________________________"

clean:
	$(DEL) $(NODE_DIR) && $(DEL) $(BOWER_DIR)

install:
	$(NPM) install
	$(BOWER) install

dev:
	$(GRUNT) serve

build: $(GRUNT_DEP) $(BOWER_DIR)
	$(GRUNT) build

targz: $(DIST_DIR)
	$(TAR) $(TAR_NAME) $(DIST_DIR)

$(BOWER_DIR): install

test: $(GRUNT_DEP) $(BOWER_DIR)
	$(GRUNT) test

version:
	$(ECHO) $(VERSION)

release: commit-release build targz

#############
# Sub tasks #
#############

$(NODE_DIR)/%:
	$(NPM) install

clean-dist: $(GRUNT_DEP)
	$(GRUNT) clean

update-release: $(GRUNT_DEP)
	$(GRUNT) release --type=$(type)

commit-release: update-release
	$(GRUNT) bump-commit
