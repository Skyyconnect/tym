'use strict';
const { geo2zip } = require('geo2zip')
const Chronosphere = require('./level.js');
const Timekeeper = require('./timeKeeper.js');



class Chronoverse{
    constructor(){
        this.chronosphere = new Chronosphere();
        this.idKey = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.timekeeper = new Timekeeper(this.generateId(this.idKey,8, " "), 1);
        this.data = [];     
        this.stack = [];
        this.que = [];
    }
    
    authenticate(user, data){
       // if(user.id == this.chronosphere.getByid())

    }
    generateId(chars, id_len, idIncludes) {
    for (var i = 0; i < id_len; i++) {
        idIncludes += chars.charAt(Math.floor(Math.random() * chars.length));   
    }
    return idIncludes;
    }

    getAvailable(user, service){
        
    }

    setAvailability(user){

    }

    setService(user, service, provider){
        return this.chronosphere.createService(service, provider);  
    }

    allTimeIntervals(user){
        

    }

    getAllApointments(user){
        var allAppointments = [];
        for(var each = 0; each < user.store.events.length; each ++){
            allAppointments.push({event: user.store.events[each].name, start: user.store.events[each].startOf, end: user.store.events[each].endOf});
        }
        return allAppointments;
        
    }

    chainAvailability(users){
        
    }

    betweenTimes(user,nameOfEvent,start, end){
        var event = this.createEvent(user,nameOfEvent, start, end)

        for(var i = 0; i < user.store.events; i++){
            if(user.store.events[i].isBetween_Start(event)&& user.store.events[i].isAvailable_Start(event)){
                
                    if (user.store.events[i].isBetween_End(event) && user.store.events[i].isAvailable_End(event)){
                            console.log("[Matched]: able to be booked.");
                            return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
        }
            
    }

    periodicAppointments(user, service){

    }

    updateVector(user){
        var total=0;
        if(user.store.events.length >=1){
            for(var i = 0; i < user.store.events.length; i++){
                total+=user.store.events[i].lengthInterval('minutes');
           }
           if(user.vectorLength > 1){
            return (user.vectorLength-total);
           }else{
               return (user.vectorLength*total);
           }

        }else{
            return console.log("There are no events scheduled: [check user.store.events]");
        }
    }
    //to do: getObject notation...
    getLocation(lat, long){
        const location = {
            latitude: lat,
            longitude: long
        };
        return geo2zip(location).then(zip => {
           console.log(zip);
        });
        
    }
// start/end must be list form ex. [2, 16, 3, 5] is [mo,d,h, min]
    createEvent(user,name, start, end){
       return this.timekeeper.createEvent(this.generateId(this.idKey, 8, user.id),name, start, end);
    }

    openStream(keyValuePair){
        if(this.chronosphere.isSphereOpen()){
            return this.chronosphere.readStream(keyValuePair);
        }else{
            return;
        }
    }
    
    addStack(user){
        this.stack.push(user.data);
        if (this.stack.length > this.que.length+1){
            this.que.push(user.data);
            console.log("there was an [Error] making a Stack request");
            return
        }
        console.log(user.data+ ' was added to the stack')
        
    }


    resolveStack(user){
        if(this.stack.length >=1){
            var extractedData = [];
            for(var i = 0; i < this.stack.length;i++){
                this.que.splice(0,0, this.stack[i])
                extractedData.push(this.stack[i])
                this.stack.pop();
                if(this.stack[i]=== null){
                    console.log("Hit a null");
                    return this.stack[i-1];
                }else{
                    console.log('extracted data succesfully')
                    return extractedData
                }
            }        
        }else{
            console.log('The [STACK] was not resolved...')
            return this.stack;
        }

    }












}var universe = new Chronoverse();


var userTom = universe.chronosphere.createUser("Tom Delonge", 1, "Music Lessons");
var event = universe.createEvent(userTom,"music",[3,21,1,15], [3,21,2,0]);
var eventb = universe.createEvent(userTom,"cat sitting", [3,20,2,30], [3,20,3,30]);
userTom.store.events.push(event);
userTom.store.events.push(eventb);
console.log(universe.betweenTimes(userTom,"Birthday Party",[2,6,2,15],[2,6,3,15]));
