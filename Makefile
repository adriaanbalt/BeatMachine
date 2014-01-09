APP_DIR = /opt/beatmachine
TEMP_INSTALL_DIR = /tmp/beatmachine
DEPLOYMENT_USER = jenkins
OS=$(shell echo `lsb_release -si` `lsb_release -sr`)
REMOTE_OS=$(sudo $(DEPLOYMENT_USER)@$(DEPLOYMENT_HOSTNAME) shell echo `lsb_release -si` `lsb_release -sr`)

clean:
	-sudo rm -rf /opt/beatmachine

install:
ifeq ($(OS),Ubuntu 12.04)
	sudo mkdir -p $(APP_DIR)
	cd expressapp; npm install
	sudo rsync -a expressapp/* /opt/beatmachine
	sudo cp ./beatmachine.conf /etc/init/
else
	@echo "Only Ubuntu 12.04 is supported. The current OS is $(OS)"
endif

deploy:
ifeq ($(OS),Ubuntu 12.04)
	ssh $(DEPLOYMENT_USER)@$(DEPLOYMENT_HOSTNAME) sudo rm -rf $(TEMP_INSTALL_DIR)
	rsync -r expressapp $(DEPLOYMENT_USER)@$(DEPLOYMENT_HOSTNAME):$(TEMP_INSTALL_DIR)
	scp ./Makefile $(DEPLOYMENT_USER)@$(DEPLOYMENT_HOSTNAME):$(TEMP_INSTALL_DIR)
	scp ./beatmachine.conf $(DEPLOYMENT_USER)@$(DEPLOYMENT_HOSTNAME):$(TEMP_INSTALL_DIR)
	ssh $(DEPLOYMENT_USER)@$(DEPLOYMENT_HOSTNAME) sed -i 's/REPLACE_ME_WITH_ENV/$(NODE_ENV)/' $(TEMP_INSTALL_DIR)/beatmachine.conf
	ssh $(DEPLOYMENT_USER)@$(DEPLOYMENT_HOSTNAME) cd $(TEMP_INSTALL_DIR)\; make stop_app
	ssh $(DEPLOYMENT_USER)@$(DEPLOYMENT_HOSTNAME) cd $(TEMP_INSTALL_DIR)\; make clean install
	ssh $(DEPLOYMENT_USER)@$(DEPLOYMENT_HOSTNAME) cd $(TEMP_INSTALL_DIR)\; make start_app
else
	@echo "Only Ubuntu 12.04 is supported. The targeted OS is $(REMOTE_OS)"
endif

start_app:
	sudo start  --no-wait beatmachine

stop_app:
	-sudo stop  --no-wait -q beatmachine
