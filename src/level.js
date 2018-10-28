'use strict';

var levelup = require('levelup');
var level = require('level');
var levelObj = require('level-object');
var sublevel = require('level-sublevel');

//var db = sublevel(level(./chronosphere_db, {valueEncoding: 'json'}))



/* 
* Class 'ChronoSphere' uses 'leveldb', but mainly only uses 'levelup'. 
* This is a key-value store both associated with the chronosphere
* and users. Each user conatins their own store to be used for anything live
* One should not use the chronosphere store until you ae ready to write.
* There is the primary put(),get(), and del() operations, you must create a user within the chronosphere.
* if you are planning on chaining actions please use the chronosphere que/stream components.
* remember: the timeKeeper is the only object that should access the chronosphere.                       
*        |creating a user|
*        timeKeeper.chronosphere.createUser(name,frequency, service);
*
*        |adding user data/events/updates|
*        timeKeeper.chronosphere.put(user.id, data)
*      
*        |readStreamm Example|
*        chronosphere.readStream(data);
*        [or]
         var stream = chronosphere.createReadStream();
*         stream.on('data', function(data)){
*             chronosphere.get(value, function(err,value){
*                 value = newValue;
*             })stream.on('close', function(){
*                 console.log(data);
*             })
*         }
*
*
*    - All actions are logged in user.store and recoreded in lastPut, lastGet keys
*/
class Chronosphere{
    constructor(){
        this.keys = [];
        this.values = [];
        this.sphere = levelup('./chronosphere_db', {db:require('leveldown'),valueEncoding: 'json'});
        this.store = levelObj(this.sphere);
        this.universe = null;
        this.keyId = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }

    put(key,data){
        return this.sphere.put(key, data, function(err){
            if(err) return console.log('error occured: [PUT]',err);    
        });    
    }

    get(key){
        return this.sphere.get(key, function(err,value){
            if(err) return console.log('error occured: [GET]', err)
            console.log(value)
           
            
    })
            
            
        }  

    set(name, key, data){
        this.store.set(name,key,data, function (err){
            this.store.toJSON(name, function(err,json){
                console.log(json);
            });
        });
    }

    del(key){
        return this.sphere.del(key, function(err){
            if(err){
                console.log('error occured: [DEL]', err)
            }
        });

    }
  /*
   * items is an arrayList ex. ([[type,key,value], [type,key,value],[type,key,value],...])
   * type is:  'put' or 'del'
   * if no value supplied, 'NULL' is default.
   */
    addDataPool(items){
        var collectData = [];
        for( var i = 0; i < items.length; i++){
            if(items[i].length < 3){
                items[i].push(null);
            }else{
            collectData.push({type: items[i][0], key: items[i][1], value: items[i][2]});
            }   
        }
        return this.sphere.batch(collectData, function (err){
            if(err) return console.log('error occured: [Create Data (batch)]', err)
                console.log('data pool was created.')
            });
    }

    addDataChain(key, data){
        return this.sphere.batch().put(key, data).write(function(){console.log('data chaining complete.')});
    }

    addToQue(key, data){
        return this.sphere.batch.put(key, data);
    }
    delFromQue(key){
        return this.sphere.batch.del(key);
    }

    clearQue(){
        return this.sphere.batch.clear();
    }

    lengthOfQue(){
        return this.sphere.batch.length;
    }

    writeQue(){
        return this.sphere.batch.write();
    }

    isSphereOpen(){
        if(this.sphere.isOpen()){
            return true
        }else{
            return false;
        }
    }

    readStream(data){
        return this.sphere.createReadStream()
            .on('data', function(data){
                console.log(data.key, '=', data.value)
            })
            .on('error', function(err){
                console.log('stream error!', err)
            })
            .on('close', function(){
                console.log('stream closed')
            })
            .on('end', function(){
                console.log('stream ended')
            })
    }
     // action is: pause, resume, destroy
    readStreamAction(action){
        if (action == 'pause'){
            return this.sphere.createReadStream.pause();
        }else if(action == 'resume'){
            return this.sphere.createReadStream.resume();
        }else if(action == 'destroy') {
            return this.sphere.createReadStream.destroy();
        }
    }

    keyStream(data){
        return this.sphere.createKeyStream()
        .on('data', function (data) {
            console.log('key=', data)
        })
    }

    valueStream(data){
        return this.sphere.createValueStream()
        .on('data', function (data) {
            console.log('value=', data)
        })
    }

    stats(){
        return this.sphere.db.getProperty('leveldb.stats');
    }
    tables(){
        return this.sphere.db.getProperty('leveldb.sstables');
    }
    //n is type string
    numFilesAt(n){ 
        return this.sphere.db.getProperty('leveldb.num-files-at-level'+n);
    }

    nuke(){
       this.universe = require('leveldown').destroy('./chronosphere_db', function (err) { console.log('Nuclear Launch Detected!') });
    }

    repair(){
       this.universe = require('leveldown').repair('./chronosphere_db', function (err) { console.log('Trying to repair the Chronosphere!') });
    }

    makePairs(){
        var pairs = []
        for(var i =0; i < this.keys.length; i++){
            pairs.push({
                key: this.keys[i],
                value: this.values[i]
            });
        }
        return pairs
    }

    searchLocalKeys(data){
        var pair = this.makePairs();
        for(var each = 0; each < this.pair.length; each++){
            if(data == pair[each].key){
                return pair[each].key;
            }
        }
        return false;
    }

    searchLocalValues(data){
        var pair = this.makePairs();
        for(var each = 0; each < this.pair.length; each++){
            if(data == pair[each].value){
                return pair[each].value;
            }
        }
        return false;
    }


    createUser(name, frequency, service){
        var user = new User(0, name, 1440, frequency)
        user.id = generateId(this.keyId,8, " ");
        user.store.id= user.id;
        user.store.services.push(service);
        this.put(user.id, user.store);
        user.data.push("Create User");
        user.store.lastPut  = user.data;
        user.isAlive = true;
        return user;
    }


    getById(id){
        return this.get(id);
    }

   disableUser(user){
       user.isActive = false;
       return user;
   }

   createService(service, provider){
      var id = generateId(this.keyId,8, " ");
      var serviced = new Service(service, provider.id, id);
      serviced.providers.push(provider.store);
      this.put(service, serviced);
      return serviced;
   }


   


}// end chronosphere


/* Class 'User' creates users to be stored in the chronosphere_db.
 * Users have their own unique id and information stored in 'user.store'. 
 * You should never access the users attributes directly; always access the store,
 * Everything else will only change within the timekeeper scope.
 * You may add events and services from the CHRONOVERSE layer. 
 * 
 * 
 * */ 

class User{
    constructor(id, name, vectorLength, frequency, service){
        this.id = id;
        this.name = name;
        this.vectorLength = vectorLength;
        this.frequency = frequency;
        this.data = [];
        this.isActive = true;
        this.store = {
            id: this.id,
            name: this.name,
            vector: new Array(this.vectorLength),
            frequency: this.frequency,    
            lastPut: null,
            lastGet: null,
            events: [],
            services: []
        }
    }
    getInfo(){
        return this.store;
    }
    push(data){
        this.data.push(data)
        this.store.lastPut.push([key,value])
        return chronosphere.put(this.id, data);
    }

    update(data){
        this.data.push(data);
        chronoasphere.put(this.id,data)
        this.store.LastPut.push([this.id,data]);
        return;
    }

     addEvents(event){
        this.store.events.push(event);
        this.data.push(event);
        chronosphere.put(this.id, this.store);
        return;
     }

     addService(service){
         this.store.services.push(service);
         chronosphere.put(this.id, this.store);
         return;
     }

        
     


}
/* Class 'Service' is used to store information about the service(s) themselves. 
 * If you need to figure out all the providers of a service; it is stored here.
 * You should update the service only when updating provider services or through chronosphere calls.
 * */

class Service{
    constructor(service,provider, id){
        this.service = service;
        this.id = id;
        this.provider = provider;
        this.providers= [];
        this.store = {
            service: this.service,
            id: this.id,
            providers: this.provider
        }
    }

    getProvidersByFrequency(cutOff){
        var ableToProvide = [];
        for (var each = 0; each < this.providers.length; each++){
            if(this.providers[each].frequency >= cutOff){
                ableToProvide.push(this.providers[each]);
            }
            
        }
        return ableToProvide;
    } 
    addProvider(provider){
        this.providers.push(provider.store);
        return;
    }

    



}





function random(num){
    return (Math.floor(Math.random * num));
}

function generateId(chars, id_len, idIncludes) {
  for (var i = 0; i < id_len; i++) {
    idIncludes += chars.charAt(Math.floor(Math.random() * chars.length));   
  }
  return idIncludes;
}



var chronosphere = new Chronosphere();
var userA = chronosphere.createUser("Skyyler Siejko", 47, "Basket Weaving");
var userB = chronosphere.createUser("tom delonge", 80, "Basket");
var serve = chronosphere.createService("Basket Weaving",userA);

//serve.addProvider(userB)
//console.log(serve.getProvidersByFrequency(90))

//userA.store.attribute



module.exports = Chronosphere;




