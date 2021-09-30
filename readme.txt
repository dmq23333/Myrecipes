How to run this system on vlab?

-1. start backend server:

1. open a terminal then cd into backend folder:
eg: cd ....../backend

2. check if installed pip3
:  pip3 --version
if not installed:
	sudo apt-get install pip
or update with:
	pip3 install --upgrade pip
if installed then run command to install depedencies:
	pip3 install -r requirements.txt
3. after all dependencies installed, run command to start server:
	python3 run.py
4. a successfully compiled message will occur then the backend server start! (then there should be an another terminal for starting the frontend server)

-2. start frontend server (should start it in another terminal):

1. open a new terminal then cd into frontend folder
eg: cd ...../frontend

2. check if 'Yarn' command is installed:
run command:    yarn --version

if not install then simply run command to install yarn:
run command:    sudo apt update && sudo apt install yarn
if installed then run command to install all dependencies:
run command:	yarn install

3. after all dependencies installed, run command  to start server
run command:	yarn start

4. a successfully compiled message will occur then could simply go to 

http://localhost:3000/

to access our project
