'use strict';

var moment = require('moment');
const express = require('express');
const app = express();

/*_________________________________________TIME_____________________________
* We are comparing "moment(s)" to eachother to extract information needed.
* Each moment has to be defined with setTime(mo,d,h,m); once created, we can 
* do method calls. The idea is to create any number of moments and reference 
* only one Time instance.
*
		* default moment is set to now timeStamp during instantiation.
*/
class Time {
	constructor() {
		this.second = moment().second();
		this.minute = moment().minute();
		this.hour = moment().hour();
		this.day = moment().day();
		this.month = moment().month();
		this.year = moment().year();
		this.now = this.setTime(this.month, this.day, this.hour, this.minute);

	}
	setTime(month, day, hours, minutes, second) {
		return (moment({ months: month, days: day, hour: hours, minute: minutes }));
	}
	addTime(time, amount, incrementOfTime) {
		return time.add(amount, incrementOfTime);
	}
	subtractTime(time, amount, incrementOfTime) {
		return time.subtract(amount, incrementOfTime);
	}
	setMax(time, when) {
		return moment.max(time, when); //function ex. moment.max(eventA,eventB)
	}
	setMin(time, when) {
		return moment.min(time, when);
	}
	start(time, incrementOfTime) {
		return time.startOf(incrementOfTime);
	}
	end(time, incrementOfTime) {
		return time.endOf(incrementOfTime);
	}
	setLanguage(time, language) { //options: 'en', 'fr', 'es'
		return time.locale(language);
	}
	getCalenderTime(time) {
		return time.calender(refrenceTime);
	}
	fromNow(time) {
		return time.fromNow();
	}
	until(time, when) {
		return time.to(when)
	}
	toJSONtime(time) {
		return time.toJSON();
	}
	object(time) {
		return time.toObject();
	}
	isBefore(time, when) {//boolean 
		return time.isBefore(when);
	}
	isBetween(time, when) {//boolean
		return time.isBetween(when);
	}
	isLeapYear(time) { //boolean
		return time.isLeapYear();
	}
	isDate(time) { //boolean
		return time.isDate();
	}
	isMoment(time) {//boolean
		return time.isMoment();
	}

} //time end

/* _________________________________________KEEPER____________________________________________________________________________
* The Keeper is the main conduit between Time and procedure. It acts as the action (method call) and resolution(getter).
* An action is defined as any operation to extract data (efficiently) with an intent to resolve in the form of needed data.
* The Keeper cannot function without Time; hence "TimeKeeper". In short, the keeper 'spits out' the goods. You may ask it for things like: 
 					* (the higher the frequency the faster the search and 'more likley' a match for the search.)
		* time
		* scheduling
		* wave information
		* queries
		* relation of id's
		* information about chronosphere items
		* accessing the chronosphere
*/
class Keeper { //need to store id events in chronosphere sum and take average.
	constructor(id) {
		this.id = id;
		this.time = new Time();
		this.data = [];	
		this.table = this.getTable(1);
		this.vector = [];
		this.give = {
			data: this.data,
			currentTime: new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"),
			vector: [],	
				}//end give
			
	}

	isEqual(vectorA, vectorB) {
		if (vectorA.length != vectorB.length) {
			throw "vector length not the same!"
		} else {
			return true;
		}

	}


	transform(vector, vi) {
		var len = vector.length;
		if (this.isEqual(vector, vi)) {
			if (len == 0) {
				return;
			} else if ((len & (len - 1)) == 0) {
				vector, vi = this.radix(vector, vi);
			} else {
				vector, vi = this.process(vector, vi);
			}
			return vector, vi;
		}

	}


	inverseTransform(vector, vi) {
		this.transform(vi, vector);
	}

	bitReverseAddressing(vector, vi, levels) {
		for (var i = 0; i < vector.length; i++) {
			var j = this.reverseBits(i, levels);
			if (j > i) {
				var temp = vector[i];
				vector[i] = vector[j];
				vector[j] = temp;
				temp = vi[i];
				vi[i] = vi[j];
				vi[j] = temp;
			}
		}

		return vector, vi;
	}

	reverseBits(x, bits) {
		var y = 0;
		for (var i = 0; i < bits; i++) {
			y = (y << 1) | (x & 1);
			x >>>= 1;
		}
		return y;
	}


	cooleyRadix(vector, vi) {
		for (var size = 2; size <= vector.length; size *= 2) {
			var halfsize = size / 2;
			var tablestep = vector.length / size;
			for (var i = 0; i < vector.length; i += size) {
				for (var j = i, k = 0; j < i + halfsize; j++ , k += tablestep) {
					var tpre = vector[j + halfsize] * this.getTable(vector.length)[0][k] + vi[j + halfsize] * this.getTable(vector.length)[1][k];
					var tpim = -vector[j + halfsize] * this.getTable(vector.length)[1][k] + vi[j + halfsize] * this.getTable(vector.length)[0][k];
					vector[j + halfsize] = vector[j] - tpre;
					vi[j + halfsize] = vi[j] - tpim;
					vector[j] += tpre;
					vi[j] += tpim;
				}
			}
		}
		return vector, vi;
	}

	radix(vector, vi) {
		var n = vector.length;
		if (this.isEqual(vector, vi)) {
			if (n == 1) {
				return;
			}
			var levels = -1;
			for (var i = 0; i < 32; i++) {
				if (1 << i == n) {
					levels = i;
				}
			}
			if (levels == -1)
				throw " vector needs to be a power of Two"

			var cos = this.getTable(n / 2)[0];
			var sin = this.getTable(n / 2)[1];
			for (var i = 0; i < n / 2; i++) {
				cos[i] = Math.cos(2 * Math.PI * i / (n / 2));
				sin[i] = Math.sin(2 * Math.PI * i / (n / 2));
			}

			this.bitReverseAddressing(vector, vi, levels);
			this.cooleyRadix(vector, vi);
			return vector, vi;
		}


	}

	getTable(n) {
		var cosTable = new Array(n);
		var sinTable = new Array(n);
		for (var i = 0; i < n; i++) {
			var j = i * i % (n * 2);
			cosTable[i] = Math.cos(Math.PI * j / n);
			sinTable[i] = Math.cos(Math.PI * j / n);
		}
		return [cosTable, sinTable]; //0 cos; 1 sin 
	}

	getPrime(n, opt) {// opt is boolean; %'s the n to zero
		if (n < 5) {
			return n;
		} else if (opt) {
			return (Math.pow(n, 2) - 1) % 24;
		} else {
			return (Math.pow(n, 2) - 1);
		}
	}

	powerOfTwo(vector, vi, n) {

		var m = 1;
		while (m < n * 2 + 1) {
			m *= 2;
			vector.values.push(m);
			vi.values.push(m);
		}
		return m;
	}


	process(vector, vi) {
		var m = this.powerOfTwo(vector, vi, vector.values.length);
		var v = vector.values;
		var viv = vi.values;
		var vTemp = new Array(m);
		var viTemp = new Array(m);
		for (var i = 0; i < v.length; i++) {
			vTemp[i] = v[i] * this.getTable(v.length)[0][i] + viv[i] * this.getTable(v.length)[1][i];
			viTemp[i] = -v[i] * this.getTable(v.length)[1][i] + viv[i] * this.getTable(v.length)[0][i];
		}
		for (var i = v.length; i < m; i++)
			vTemp[i] = viTemp[i] = 0;
		var newVector = new Array(m);
		var newVectori = new Array(m);
		newVector[0] = this.getTable(v.length)[0][0];
		newVectori[0] = this.getTable(v.length)[1][0];
		for (var i = 1; i < v.length; i++) {
			newVector[i] = newVector[m - i] = this.getTable(v.length)[1][i];
			newVectori[i] = newVectori[m - i] = this.getTable(v.length)[0][i];
		}
			for (var i = v.length; i <= m - v.length; i++) {
				newVector[i] = newVectori[i] = 0;
			}

		var convoR = new Array(m);
		var convoi = new Array(m);

		this.convolveComplex(vTemp, viTemp, newVector, newVectori, convoR, convoi);
		for (var i = 0; i < v.length; i++) {
			v[i] = convoR[i] * this.getTable(v.length)[0][i] + convoi[i] * this.getTable(v.length)[1][i];
			viv[i] = - convoR[i] * this.getTable(v.length)[1][i] + convoi[i] * this.getTable(v.length)[0][i];
		}

		return vi

	}

	convolveReal(vectorX, vectorY, out) {
		if (this.isEqual(vectorX, vectorY) && this.isEqual(vectorX, out)) {
			var zeros = new Array(vectorX.length);
			for (var i = 0; i < zeros.length; i++)
				zeros[i] = 0;
			this.convolveComplex(vectorX, zeros, vectorY, zeros.slice(), out, zeros.slice());
		}
	}

	convolveComplex(vectorX, vectorXi, vectorY, vectorYi, outR, outi) {
		if (this.isEqual(vectorX, vectorXi) && this.isEqual(vectorX, vectorY) && this.isEqual(vectorY, vectorYi) && this.isEqual(vectorX, outR) && this.isEqual(outR, outi)) {
			vectorX = vectorX.slice();
			vectorXi = vectorXi.slice();
			vectorY = vectorY.slice();
			vectorYi = vectorYi.slice();

			this.transform(vectorX, vectorXi);
			this.transform(vectorY, vectorYi);

			for (var i = 0; i < vectorX.length; i++) {
				var temp = vectorX[i] * vectorY[i] - vectorXi[i] * vectorYi[i];
				vectorXi[i] = vectorXi[i] * vectorY[i] + vectorX[i] * vectorYi[i];
				vectorX[i] = temp;
			}
			this.inverseTransform(vectorX, vectorXi);
			for (var i = 0; i < vectorX.length; i++) {  // Scaling (because this FFT implementation omits it)
				outR[i] = vectorX[i] / vectorX.length;
				outi[i] = vectorXi[i] / vectorX.length;

			}

		}

	}

	preVectors(eventA, eventB){
		return [eventA.isAvailable_Start(eventB)['start_Data'][eventA.isAvailable_Start(eventB)['start_Data'].length-1], eventA.isAvailable_End(eventB)['end_Data'][eventA.isAvailable_End(eventB)['end_Data'].length-1]];	
	}

	buildWave(Vi, Vwave){ //need to spit out Vwave with the persons changed info (this is inclusive of event sums)
		//if(Vi.angle)
	}

	createEvent(id,name, start, end){
		return new Event(id, name, start, end);
	}



}//keeper end 








/* _________________________EVENT__________________________________
* An Event is an object which is created for use by the Keeper to 
* relate two instances together.

* timeIndex: month = 0; day = 1; hour = 3; minute = 4; ex. startOf[3] gives back hour of event
*/
class Event {
	constructor(id,name, start, end) {
		this.id = id;
		this.name = name;
		this.start = start;
		this.end = end;
		this.time = new Time();
		this.startOf = [this.setStart().month(), this.setStart().day(), this.setStart().hour(), this.setStart().minute()];
		this.endOf = [this.setEnd().month(), this.setEnd().day(), this.setEnd().hour(), this.setEnd().minute()];
		this.timeStamp = moment([]);
		this.data = [];
		this.vector = new Vector(this.lengthInterval('minutes'), this.lengthInterval('minutes'),this.lengthInterval('minutes'), 1);
		this.magnitude = this.vector.magnitude*this.lengthInterval('minutes'); 
	}

	setStart() {
		return this.time.setTime(this.start[0], this.start[1], this.start[2], this.start[3], this.start[4]);
	}

	setEnd() {
		return this.time.setTime(this.end[0], this.end[1], this.end[2], this.end[3], this.end[4]);
	}

	lengthInterval(incrementOfTime) {
		return this.setEnd().diff(this.setStart(), incrementOfTime);
	}

	setMaxInterval(incrementOfTime, max) {
		return (this.lengthInterval(incrementOfTime) + max);
	}

	getInterval(){
			return [this.lengthInterval('hours'), this.lengthInterval('minutes')-(this.lengthInterval('hours')*60)];
		} 



	hasBeenchecked(eventToCheck) {
		if (event.id.includes(eventToCheck.id.timeStamp.isValid())) {
			return true;
		} else {
			return false;
		}
	}

	isAvailable_Start(event) {
		for (var i = 0; i < this.startOf.length; i++) {
			if (this.startOf[i] != 0 && event.startOf[i] != 0) {
				if (this.startOf[i] != event.startOf[i]) {
					return false;
				} else {
					this.data.push(this.startOf.indexOf(this.startOf[i]));
				}
				
			}
		}
		this.data.push(this.getInterval());
		return {
					start_Date: this.setStart().calendar(),
					start_Day: this.setStart().weekday(),
					start_Time: this.startOf[2] + ":" + this.startOf[3],
					start_Data: this.data		
		};

	}

	isAvailable_End(event) {
		for (var i = 0; i < this.endOf.length; i++) {
			if (this.endOf[i] != 0 && event.endOf[i] != 0) {
				if (this.endOf[i] != event.endOf[i]) {
					return false;
				} else {
					this.data.push(this.endOf.indexOf(this.endOf[i]));
				}
			}
		}
		this.data.push(this.getInterval());
		return {
			end_Date: this.setEnd().calendar(),
			end_Day: this.setEnd().weekday(),
			end_Time: this.endOf[2] + ":" + this.endOf[3],
			end_Data: this.data
		};


	}

	dump() {
		this.data = [];
	}

	isBetween_Start(event){
			if(this.setStart().isBetween(event.setStart())){
				return this.lengthInterval('minutes')-this.startOf[3];
			}else{
				return false;
			
		}
		
	}

	isBetween_End(event){
			if(this.setEnd().isBetween(event.setEnd())){
				return this.lengthInterval('minutes')-this.endOf[3];
			}else{
				return false;
			}
		}
		
	




}// Event end







/*__________________________VECTOR__________________________________
* Vector is the main object we use for fft. It is the best form to 
* manipulate data with and use in algorithm heavy dependencies.
		* [1 right; -1 left, i up; -i down]
*/
class Vector {
	constructor(x, y, z, direction) {
		this.y = y;
		this.x = x;
		this.z = z;
		this.magnitude = Math.abs(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
		this.direction = direction;
		this.values = [];
		this.frequency = 1;
	}

	dotProductAngle(vector, theta) {
		return this.magnitude * vector.magnitude * Math.cos(theta);
	}

	dotProduct(vector) {
		return (this.x * vector.x + this.y * vector.y + this.z * vector.z);
	}

	twoDrotate(theta, i, j) {
		var iRot = this.values[i] * Math.cos(theta) - this.values[j] * Math.sin(theta);
		var jRot = this.values[i] * Math.sin(theta) + this.values[j] * Math.cos(theta);
		return [iRot, jRot];
	}


	threeD_Rotoate_X(theta, i, j, k) {
		var jRot = this.values[j] * Math.cos(theta) - this.values[k] * Math.sin(theta);
		var kRot = this.values[j] * Math.sin(theta) + this.values[k] * Math.cos(theta);
		return [i, jRot, kRot];
	}

	threeD_Rotate_Y(theta, i, j, k) {
		var iRot = this.values[i] * Math.cos(theta) - this.values[k] * Math.sin(theta);
		var kRot = -this.value[i] * Math.cos(theta) + this.values[k] * Math.cos(theta);
		return [iRot, j, kRot]
	}

	threeD_Rotoate_Z(theta, i, j, k) {
		var iRot = this.values[i] * Math.cos(theta) - this.values[j] * Math.sin(theta);
		var jRot = this.values[i] * Math.sin(theta) + this.values[j] * Math.cos(theta);
		return [iRot, jRot, k];
	}


	isOrthogonal(vector, theta) {
		if (this.dotProduct(vector, theta) == 0) {
			return true;
		} else {
			return false;
		}
	}

}




/*
//_________________________TEST-CASE(S)_________________________
var orthogonal = (vectorA, vectorB, theta) => { return vectorA.isOrthogonal(vectorB, theta); }
const dot = (vectorA, vectorB) => { return vectorA.dotProduct(vectorB); }
const scale = (vector, n) => { return n * vector.magnitude; }
var eventA = new Event(2,"basket Weaving", [2, 16, 3, 5], [2, 16, 6, 32]);
var eventB = new Event(4,"apple testing" [2, 16, 3, 5], [2, 16, 6, 32]);
var keeper = new Keeper(1, eventB.vector.values.length, eventA, eventB);
//console.log("_________________________________");
console.log(eventA.isAvailable_Start(eventB));
eventA.dump();
console.log("_________________________________");
console.log(eventA.isAvailable_End(eventB));

//console.log(keeper.vector);


module.exports = Keeper;