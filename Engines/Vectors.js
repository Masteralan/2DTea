/*
Made by Alan O'Cull -- Also known as Masteralan or @MasterAlan2001 on Twitter
My website: http://home.codefromjames.com/alan/

This lets you make vectors in any dimension, from 1D to 247D. Just overall handy tool with lots of cool math.

2D Tea - Basic game engine used for easy development of 2D games in JavaScript.
Copyright(C) 2018, Alan O'Cull
I hereby give you permission to use this script specifically wherever you like if you want to. It would be nice to note me as the original author though.
*/


// Random useful math functions
var Radian = (Math.PI/180)
var RadianFull = Math.PI*2
function DegreeToRadian(val){               //Converts values in degrees to radians.
	return ((val || 360)/360)*RadianFull
};
function RadianToDegree(val){               //Converts values in radians to degrees.
	var d = ((val || RadianFull)/RadianFull)*360
	return d
};
function Lerp(v, v2, n){    //Tweens/Lerps between the first number and the second number with n%.
	return (v*(1-n) + v2*n)
};
function Random(n1, n2){    //Generates a random number between the given range. Does not round.
	n1 = n1 || 0;
	n2 = n2 || 1;
	if (n1 > n2) {
		var v = n2;
		n2 = n1;
		n1 = v;
	};

	return n1 + (n2-n1)*Math.random();
};
function NumberListPosition(list, p) {  //Finds the value of 'y' at whatever percentage (x) asked for on the given number list.
	var c = (list.length-1)*p;
	var cm = Math.floor(c);

	//return list[cm] + (list[Math.ceil(c)]-list[cm])*p;
	return Lerp(list[cm], list[Math.ceil(c)], c-cm);
};
function ValRange(p1, p2){
	var v = Math.abs(Math.abs(p1)-Math.abs(p2));
	console.log(v)
	return v
};
var HexBits = [0,1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f"];
function Color3ToHex(r,g,b){            //Converts given RGB value to Hexadecimal. Returns a hexadecimal-value string.
	r = r || 0; g = g || 0; b = b || 0;
	r = Math.floor((r/255)*31 + .5);
	g = Math.floor((g/255)*31 + .5);
	b = Math.floor((b/255)*31 + .5);

     if (r <= 0){r = 1};
     if (g <= 0){g = 1};
     if (b <= 0){b = 1};

	var r1 = r; var r2 = 1;
	if (r1 >= 16){
		r2 = r1-15;
		r1 = 16;
	};
     console.log(r2);
	r1 = HexBits[r1-1]; r2 = HexBits[r2-1];

	var g1 = g; var g2 = 1;
	if (g1 >= 16){
		g2 = g1-15;
		g1 = 16;
	};
	g1 = HexBits[g1-1]; g2 = HexBits[g2-1];

	var b1 = b; var b2 = 1;
	if (b1 >= 16){
		b2 = b1-15;
		b1 = 16;
	};
	b1 = HexBits[b1-1]; b2 = HexBits[b2-1];

	return ("#" + r1+r2 + g1+g2 + b1+b2);
};
function SpliceFromTable(obj, tab){ //Takes given object out of given table.
	n = tab.indexOf(obj);
	if (n !== -1) {
		tab.splice(n, 1);
	};
};


var Vector = {
	/*New: function(t) {
		for (var i = 0; i < t.length; i++) {

		};
	};*/
	VectorToCoords: function(t) {       //Converts given vector (list) into an array with values x, y, (and z).
		if (t.length == 2) {
			return {x: t[0], y: t[1]};
		} else if (t.length == 3) {
			return {x: t[0], y: t[1], z: t[2]}
		} else {
			return t;
		};
	},
	
	
	
	// Special Functions
	Magnitude: function(t) {	//Finds the magnitude of the given vector. // magnitude^(1/n) = E(x^n)	- Came up with this formula on my own, but it works and makes mathematical sense.
		var magnitude = 0;
		for (var i = 0; i < t.length; i++) {
			magnitude = magnitude + Math.pow(Math.abs(t[i]),t.length);
		};
		return Math.pow(magnitude,(1/t.length));
	},
	Unit: function(t) {         //Normalizes the vector.
		var div = 0;
		var newT = [];
		for (var i = 0; i < t.length; i++) {
			div = div + Math.abs(t[i]);
		};
		for (var i = 0; i < t.length; i++) {
			newT.push(t[i]/div);
		};
		return newT;
	},
	Lerp: function(t, t2, n) {  //Lerps between the given 2 vectors.
		var nT = [];

		for (var i = 0; i < t.length; i++) {
			nT.push(Lerp(t[i], t2[i], n))
		};

		return nT
	},
	Round: function(t){         //Rounds the given vector to nearest whole numbers.
		var nT = [];
		for (var i = 0; i < t.length; i++) {
			nT.push(Math.floor(t[i]+.5))
		};
		return nT
	},
	Midpoint: function(t) {     //Finds the midpoint of a list of vectors.
		var newT = [];
		for (var i = 0; i < t[1].length; i++) {
			newT.push(0);
		};
		for (var x = 0; x < t.length; x++) {
			for (var i = 0; i < t[x].length; i++) {
				newT[i] = newT[i]+(t[x])[i];
			};
		};
		for (var i = 0; i < newT.length; i++) {
			newT[i] = newT[i]/t.length;
		};
		return newT;
	},
	CenterOfMass: function(t, t2) { //Same as midpoint, but with only two vectors
		var newT = [];
		for (var i = 0; i < t.length; i++) {
			newT.push(t[i]+t2[i]);
		};
		for (var i = 0; i < t.length; i++) {
			newT[i] = newT[i]/2;
		};
		return newT;
	},



	// Arithematic Functions
	Add: function(t, t2) {      //Adds the given vectors together.
		var newT = [];
		for (var i = 0; i < t.length; i++) {
			newT.push(t[i]+t2[i]);
		};
		return newT;
	},
	Subtract: function(t, t2) { //Subtracts the second vector from the first.
		var newT = [];
		for (var i = 0; i < t.length; i++) {
			newT.push(t[i]-t2[i]);
		};
		return newT;
	},
	MultiplyVector: function(t, t2) {   //Multiplies the given vectors together.
		var newT = [];
		for (var i = 0; i < t.length; i++) {
			newT.push(t[i]*t2[i]);
		};
		return newT;
	},
	DivideVector: function(t, t2) {     //Diveds the first vector by the second.
		var newT = [];
		for (var i = 0; i < t.length; i++) {
			newT.push(t[i]/t2[i]);
		};
		return newT;
	},
	MultiplyNum: function(t, n) {       //Multiplies the given vector by a number.
		var newT = [];
		for (var i = 0; i < t.length; i++) {
			newT.push(t[i]*n);
		};
		return newT;
	},
	DivideNum: function(t, n) {         //Divides the given vector by a number.
		var newT = [];
		for (var i = 0; i < t.length; i++) {
			newT.push(t[i]/n);
		};
		return newT;
	},
	Negate: function(t) {               //Negates the given vector.
		var newT = [];
		for (var i = 0; i < t.length; i++) {
			newT.push(-t[i]);
		};
		return newT;
	},


	//These functions are not at all necessary, but made for easier, faster, and more efficient code.
	Distance: function(t, t2) {
		return (Vector.Magnitude(Vector.Subtract(t, t2)));
	},
	Direction: function(t, t2) {
		return (Vector.Unit(Vector.Subtract(t, t2)));
	},
	Average: function(list) {
		var p = list[0];
		for (var i = 1; i < list.length; i++){
			p = Vector.Add(p, list[i]);
		};
		return Vector.DivideNum(p, list.length);
	},
	ClosestToPoint: function(list, pos) {   //Finds the closest vector position in a given list of vectors to a given position (that's also a vector)
		var p = list[0];
		var d = Vector.Distance(list[0], pos);
		for (var i = 1; i < list.length; i++){
			var d2 = Vector.Distance(list[i], pos);
			if (d2 < d){
				p = list[i];
				d = d2;
			}
		}
		
		return p;
	},
	ClosestToPointByUnit: function(list, pos, home) { //Finds the closest point from a list of position vectors to a ray. Position and Home are two points that are followed.
		var p = list[0];
		var d = 0;		//Infinity; Math.min();
		for (var i = 0; i < list.length; i++){
			var direct = Vector.Direction(home, list[i]);
			direct[0] += home[0]; direct[1] += home[1];
			//console.log("Point(" + list[i][0] + ", " + list[i][1] + "):			Direction:(" + direct[0] + ", " + direct[1] + ")			NewPosition:(" + newPos[0] + ", " + newPos[1] + ")");
			var d2 = Vector.Distance(direct, pos);
			if (d2 > d){
				p = list[i];
				d = d2;
			}
		}
		
		return p;
	},
	AddToTable: function(list, pos){    //Adds the given number to the vector.
		var newT = [];
		for (var i = 0; i < list.length; i++){
			newT[i] = Vector.Add(list[i], pos);
		};
		
		return newT;
	},
	
	
	
	// Hitboxing //
	GetHitboxCorners: function(t){  //Turns any given amount of positions/vectors in a list into a square hitbox.
		var c1 = t[0];
		var c3 = t[0];

		for (var i = 0; i < t.length; i++) {
			if (t[i][0] < c1[0]) {
				c1 = [t[i][0], c1[1]]
			};
			if (t[i][0] > c3[0]) {
				c3 = [t[i][0], c3[1]]
			};

			if (t[i][1] < c1[1]) {
				c1 = [c1[0], t[i][1]]
			};
			if (t[i][1] > c3[1]) {
				c3 = [c3[0], t[i][1]]
			}
		};

		var c2 = [c3[0], c1[1]];
		var c4 = [c1[0], c3[1]];

		return [c1, c2, c3, c4];
	},
	GenerateHitboxFromScale: function(t){   //Generates a hitbox
		var c1 = [-t[0]/2, -t[1]/2];
		var c3 = [t[0]/2, t[1]/2];
		var c2 = [c3[0], c1[1]];
		var c4 = [c1[0], c3[1]];

		return [c1, c2, c3, c4];
	},
	
	
	
	// Trigonometry
	ComputeVector: function(mag, angle) {
		angle = angle*Radian
		//return Vector.MultiplyNum([Math.cos(angle), Math.sin(angle)], mag);
		return Vector.MultiplyNum([Math.cos(angle), Math.sin(angle)], mag);	//Grounds distances and then multiplies by magnitude for perfect translation
	},
	ComputeAngle: function(vector) {
		var mag = Vector.Magnitude(vector);
		var angle = Math.atan(vector[0]/vector[1]);
		angle = RadianToDegree(angle);
		if (vector[1] < 0){
			angle = angle + (angle/Math.abs(angle))*180
		};
		return {Magnitude: mag, Angle: angle};
	},
	RotateVector: function(vector, angle) {
		//console.log("");
		//console.log("Rotating Vector...");
		//console.log(vector);
		var v = Vector.ComputeAngle(vector);
		//console.log("Magnitude:");
		//console.log(v.Magnitude);
		//console.log("Angle:");
		//console.log(v.Angle);
		var v2 = Vector.ComputeVector(v.Magnitude, v.Angle + angle);
		//console.log(v2);
		return Vector.ComputeVector(v.Magnitude, v.Angle + angle);
	},


	// Ease of Use
	AnglePoints: function(v1, v2){
		return Vector.ComputeAngle(Vector.Subtract(v2, v1));
	}
};
