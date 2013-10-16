Hydra
=====

"If a head is cut off, two more will take its place"  
  
http://innotech.github.io/hydra/

# What is Hydra?
Hydra is multi-cloud application discovery, management and balancing service.

- [Deploy](#a1)
 * [Prerequisites](#b1)
 * [Install nodejs](#b2)
 * [Install mongodb](#b3)
 * [Get Hydra source code](#b4)
 * [Install dependencies](#b5)
 * [Configure Hydra](#b6)
- [Launching](#a2)
- [Hydra Client](#a3)
- [License](#a4)

Hydra attempts to ease the routing and balancing burden from servers and delegate it on the client (browser, mobile app, etc).   

<a name="a1"/>
# Deploy
<a name="b1"/>
## Prerequisites
* build tools (gcc 4.2+, build-essential, yum groupinstall "Development Tools")
* python 2.6+
* python-devel package
* pip python package manager (http://www.pip-installer.org/en/latest/installing.html)
* python psutil (install via pip)
* ssh
* git
* Increase max number of file descriptors (http://www.xenoclast.org/doc/benchmark/HTTP-benchmarking-HOWTO/node7.html)
<a name="b2"/>
## Install nodejs

* Install from <a href="https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager">Ubuntu PPA</a> 

or

* Download nodejs source code from http://nodejs.org/download/
Latest build at the time of writing is 0.10.20

```
wget http://nodejs.org/dist/v0.10.20/node-v0.10.20.tar.gz
```
* Unzip

```
tar xvfz node-v0.10.20.tar.gz
```

* Compile and install

```
cd node-v0.10.20
./configure
make // -j<num cores + 1> for faster compiling
make install // as superuser
```
<a name="b3"/>
## Install mongodb
Follow this instructions: 
* Ubuntu - http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
* CentOS/Fedora - http://docs.mongodb.org/manual/tutorial/install-mongodb-on-red-hat-centos-or-fedora-linux/

<a name="b4"/>
## Get Hydra source code

```
git clone https://github.com/innotech/hydra_server.git
```
<a name="b5"/>
## Install dependencies
```
cd hydra/src/lib/
npm install
```
<a name="b6"/>
## Configure Hydra

### Configure Hydra Server

#### Modify ./hydra/src/lib/config/local.json
* Change publicUrl for the public url of your service, this is the url that will be used for other hydras.
* Change serverPort, this is the base port that will be used to sync with other hydras.
* Modify timeouts on app and server.
* Modify mongodb configuration.
* Add your own QLog credentials (optional).

#### Configure AppManager and AppManagerInforServer
More information <a href="https://github.com/innotech/hydra_app_manager">here</a>.

<a name="a2"/>
# Launching

Use the command run.sh on the src folder

```
node ./client_api/app/main.js --port=<client_api_port> --env=<environment> 
node ./server_api/app/main.js --port=<server_api_port> --env=<environment>
```

* environment - name of the environment file to use (local)
* client_api_port - port used by the client api
* server_api_port - port used by the server api and syncronization

Using main ports, such as 80 or 443, requires that no other application is listening on that port and superuser rights.

<a name="a3"/>
# Hydra Client
More information <a href="https://github.com/innotech/hydra_node_client">here</a>.

<a name="a4"/>
# License

(The MIT License)

Authors:  
Germán Ramos &lt;german.ramos@gmail.com&gt;  
Pascual de Juan &lt;pascual.dejuan@gmail.com&gt;  
Jonas da Cruz &lt;unlogic@gmail.com&gt;  
Luis Mesas &lt;luismesas@gmail.com&gt;  
Alejandro Penedo &lt;icedfiend@gmail.com&gt;  
Jose María San José &lt;josem.sanjose@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
