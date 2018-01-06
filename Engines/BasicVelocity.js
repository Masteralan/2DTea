// Made by Alan O'Cull; AKA Masteralan or MasterAlan2001
// Basic phyusics engine. Will probably re-write later on to be convex and more realistic.

// Value Setup
var width = window.innerWidth;
var height = window.innerHeight;

var PhysicsProps = [];
var Physics = {
	lastTime: 0,
	period: 1000,   // In milliseconds - 1000 ms = 1 second
	enabled: true,
	rotational: false,

	speed: 1,

	meter: 150,	//How many pixels are in a meter
	gravity: 9.81*150,	//Gravity, Earth's gravity is 9.81 m/s/s
	gravEnabled: true,//Gravity enabled? Used to save setting and cut back on calculations.

	pgPoint: [0,0],	//Point-Gravity Point
	pgGrav: 1250,//Force of Point-Gravity
	pgEnabled: false,//Point-Gravity enabled? Used to save settings and cut back on calculations.


	floor: height-150,	//Set to 0 to remove; just basic Y collisions so I don't have to place blocks
	floorElasticity: 0.125,
	floorFriction: 0.25,



	GetDistance: function(num){
		if (num == undefined){return 0};
		var m = num/Physics.meter;
		var f = m*0.9144*3;
		var i = (f-Math.floor(f));
		f = f-i;
		i = i*12;
		console.log("Pixel distance " + num + " is equivalent to:");
		console.log(m + " meters");
		console.log(f + " feet and " + i + " inches");
		return m
	},
	GetTouching: function(obj1, p1, obj2, p2, showDebug){
		// Create initial values
		//var p1 = obj1.Position;
		//var p2 = obj2.Position;
		var v1b = [];
		var v2b = [];
		showDebug = showDebug || Debug;
		
		
		//Find center of possible collision, shift all of the vertice tables towards it, and get the cloeset points
		var center = Vector.Average([p1, p2]);
		
		/*if (p1[1] < p2[1]){
			var pSwitch = p1;
			p1 = p2;
			p2 = pSwitch;
			
			var oSwitch = obj1;
			obj1 = obj2;
			obj2 = oSwitch;
		};*/
		
		var v1 = Vector.AddToTable(obj1.Vertices, p1);
		var v2 = Vector.AddToTable(obj2.Vertices, p2);
		if (obj1.Velocity.HitboxSize !== undefined){
			v1 = Vector.AddToTable(Vector.GenerateHitboxFromScale(obj1.Velocity.HitboxSize), p1);
		};
		if (obj2.Velocity.HitboxSize !== undefined){
			v2 = Vector.AddToTable(Vector.GenerateHitboxFromScale(obj2.Velocity.HitboxSize), p2);
		};
		
		var pp1 = Vector.ClosestToPoint(v1, center);
		var pp2 = Vector.ClosestToPoint(v2, center);
		
		
		
		// Remove already-found points from groups
		for (var i = 0; i < v1.length; i++){
			if (v1[i] !== pp1){
				v1b.push(v1[i]);
			};
		};
		for (var i = 0; i < v2.length; i++){
			if (v2[i] !== pp2){
				v2b.push(v2[i]);
			};
		};
		
		
		
		//Find second closest point/other part of closest side
		var pp3 = Vector.ClosestToPointByUnit(v1b, center, pp1);
		var pp4 = Vector.ClosestToPointByUnit(v2b, center, pp2);
		var pp = [pp1, pp2, pp3, pp4];					//Get group of all the points
		
		
		
		// We now have the 4 closest points to the center of the possible collisions
		// Check possible combinations and create the groups based on which two opposing points are cloeset for line-drawing
		var g1 = [pp1];
		var g2 = [pp3];
		if (Vector.Distance(pp1, pp4) < Vector.Distance(pp1, pp2)){
			g1.push(pp4);
			g2.push(pp2);
		} else {
			g1.push(pp2);
			g2.push(pp4);
		};
		var g1c = Vector.Average(g1);
		var g2c = Vector.Average(g2);
		var gac = Vector.Average([g1c, g2c]);
		
		if (g1c[1] < g2c[1]){
			var storedVariable = g1c;
			g1c = g2c;
			g2c = storedVariable;
		};
		
		var slope = (g1c[1]-g2c[1])/(g1c[0]-g2c[0]);
		if (isNaN(slope) == true){
			return [false];
		} else if (slope >= Infinity){
			slope = 0;	//6860952557322238
		} else if (slope <= -Infinity){
			slope = 0;	//-6860952557322238
		};
		function GetY(x){
			return slope*(x-center[0]) + center[1];
		};
		function GetX(x){
			return (x-center[1])/slope + center[0];
		};
		function GetDir(dir){
			var y = center[1] + dir;
			return Vector.Unit([GetX(y), y]);
			//return dir;
		};
		
		if (showDebug == true){
			//console.log("Showing debug breakdown of collision detection!");
			//console.log("Slope of Predicted Collision: " + slope);
			var d = Vector.AnglePoints(g1c, g2c);

			//var line = Instance.New("Prop", "RayDebug Line", true, [5,d.Magnitude], Vector.DivideNum(Vector.Add(g1c, g2c), 2), -d.Angle, 4, "#ff0000", undefined, .25);
			//line.Opacity = .25;
			line.Resize([5,d.Magnitude], 4);
			line.Position = Vector.DivideNum(Vector.Add(g1c, g2c), 2);
			line.Rotation = -d.Angle;
			
			/*	var pp1v = Instance.New("Prop", "CollisionDebug Point1", true, [8,8], pp1, 0, 5, "#ffffff");
			var pp2v = Instance.New("Prop", "CollisionDebug Point2", true, [8,8], pp2, 0, 5, "#ffffff");
			var pp3v = Instance.New("Prop", "CollisionDebug Point3", true, [8,8], pp3, 0, 5, "#ffffff");
			var pp4v = Instance.New("Prop", "CollisionDebug Point4", true, [8,8], pp4, 0, 5, "#ffffff");
			var centerv = Instance.New("Prop", "CollisionDebug Center", true, [5,5], center, 0, 3, "#f0f0f0");
			var p1v = Instance.New("Prop", "CollisionDebug Prop1", true, [6,6], p1, 0, 4, "#fffffff");
			var p2v = Instance.New("Prop", "CollisionDebug Prop2", true, [6,6], p2, 0, 4, "#fffffff");	*/
			
			pp1v.Position = pp1;
			pp2v.Position = pp2;
			pp3v.Position = pp3;
			pp4v.Position = pp4;
			centerv.Position = center;
			p1v.Position = p1;
			p2v.Position = p2;

			/*
			pp1v.Destroy();
			pp2v.Destroy();
			pp3v.Destroy();
			pp4v.Destroy();
			centerv.Destroy();
			p1v.Destroy();
			p2v.Destroy();
			*/
			//Time.Speed = 0.05;
			//Time.Paused = true;
		};
		
		// Make sure no vertices above cross the line and no vertices below cross the line
		/*if ((GetY(pp1[0]) > pp1[1] && GetY(pp1[0]) !== center[1]) || (GetY(pp2[0]) < pp2[1] && GetY(pp2[0]) !== center[1])){
			return [true, GetDir(pp1[1]), center];
		} else if ((GetY(pp3[0]) > pp3[1] && GetY(pp3[0]) !== center[1]) || (GetY(pp4[0]) < pp4[1] && GetY(pp4[0]) !== center[1])){
			return [true, GetDir(pp1[-1]), center];
		};*/
		
		if (((pp1[0] >= gac[0] && p1[0] <= gac[0]) || (pp1[0] <= gac[0] && p1[0] >= gac[0]))	&&	((pp1[1] >= gac[1] && p1[1] <= gac[1]) || (pp1[1] <= gac[1] && p1[1] >= gac[1]))){
			//Check if Xs are split
			//Check if Ys are split
			//var dir = Vector.Unit([GetX(gac[1]), GetY(gac[0])]);	//Vector.Direction(gac, pp1);
			//dir = Vector.RotateVector(dir, 90);
			//var dir = Vector.Direction(center, gac);
			//dir[0] = Math.abs(dir[0]) * Math.sign(Vector.Direction(p1, gac)[0]);
			//dir[1] = Math.abs(dir[1]) * Math.sign(Vector.Direction(p1, gac)[1]);
			return [true, Vector.Direction(gac, g1c), gac, Vector.Subtract(g1c, g2c)];
		}
		
		return [false];
	},
	FireRaycast: function(start, offset, ccwnc, ignore, showDebug){
		if (start == undefined || offset == undefined){return};

		//var dir = Vector.Subtract(start, offset);
		//var m = Vector.Magnitude(dir);
		var dir = Vector.Unit(offset);
		//var dir2 = dir[0]/dir[1]      //Just a test
		dir = dir[1]/dir[0]      //Rise over run

		var xMin = start[0];
		var xMax = start[0]+offset[0];
		var yMin = start[1];
		var yMax = start[1]+offset[1];
		var xRange = Math.abs(xMin-xMax);

		if (xMin > xMax){	//Minimum is really maximum! Swap variables.
			var s = xMax;	//Saves variable
			xMax = xMin;	//Does the old switch-er-roo
			xMin = s;
		};
		if (yMin > yMax){
			var s = yMax;
			yMax = yMin;
			yMin = s;
		};

		//Formula: y = dir*x + start[1];
		function GetY(x){
			return (dir*(x-start[0]) + start[1]);
		};
        function GetX(y){
            return ((y-start[1])/dir + start[0]);
        };

		var hit = [];

		if (ccwnc !== true && ccwnc !== false){ccwnc = false};	//Can collide with non-collideable
		for (var i = 0; i < PhysicsProps.length; i++) {
			var obj = PhysicsProps[i].prop;

			var doObj = true;
			if (ccwnc == false && PhysicsProps[i].collision == false){doObj == false};

			if (ignore !== undefined && doObj == true){
				for (var x = 0; x < ignore.length; x++){
					if (ignore[x] == obj){
						doObj = false;
						break;
					};
				};
			};

			if (doObj == true){
				var v = obj.Vertices;
				for (var x = 0; x < v.length; x++){
					var p1 = v[x];
                         var p2 = v[x+1];
                         if (p2 == undefined){p2 = v[0]};

					if (p1[1] < p2[1]){
						var s = p2[1];
						p2[1] = p1[1];
						p1[1] = s;
					};
					if (p1[0] > p2[0]){
                        var s = p2[0];
						p2[0] = p1[0];
						p1[0] = s;
					};
					
					p1 = Vector.Add(p1, obj.Position);
					p2 = Vector.Add(p2, obj.Position);
					
					if (((p1[0] >= xMin && p1[0] <= xMax) || (p2[0] >= xMin && p2[0] <= xMax) || (p1[0] <= xMin && p2[0] >= xMin))
                              ||	(xRange == 0 && ((p1[1] >= yMin && p1[1] <= yMax) || (p2[1] >= yMin && p2[1] <= yMax)))){

						//Get Position in X and Y range
     					var py = (p1[1]+p2[1])/2;
     					var px = (p1[0]+p2[0])/2;
                        var y = GetY(px);
                        var nx = GetX(py);
                        y = GetY(nx);
                        console.log([px, py]);
                        console.log([nx, y]);
                        console.log("okay");
     					if (nx >= p1[0] && nx <= p2[0]         &&      y >= p2[1] && y <= p1[1]){
     						hit.push([obj, [nx, y]]);
     					};
					};
				};
			};
		};

		var result = undefined;
		if (hit.length > 0){
			result = hit[0];
			if (hit.length > 1){
				for (var i = 0; i < hit.length; i++){
					if (Vector.Distance(start, (hit[i])[1]) < Vector.Distance(start, result[1])){
						result = hit[i];
					};
				};
			};
		} else {
			result = [undefined, Vector.Add(start, offset)];
		};

		if (showDebug == true){
			console.log("Running raycast!");
			console.log("Slope of Raycast: " + dir);
			console.log("Domain Min: " + xMin + "; Domain Max: " + xMax);

			if (result[0] !== undefined && result[0].Name !== undefined){
				console.log("Result Hit: " + result[0].Name);
			} else {
				console.log("Result Hit: " + result[0]);
			};

			console.log("Result Intersect: " + result[1]);

               console.log(Vector.Subtract(result[1], start));
			var d = Vector.AnglePoints(start, result[1]);

			var line = Instance.New("Prop", "RayDebug Line", true, [5,d.Magnitude], Vector.DivideNum(Vector.Add(start, result[1]), 2), -d.Angle, 4, "#ffffff", undefined, .25);
               if (result[0] !== undefined){
                    line.Color = "#ff0000";
               };
               line.Opacity = .25;

               var startP = Instance.New("Prop", "RayDebug Start", true, [5,5], start, 0, 6, "#ffffff", "#000000");
			var endP = Instance.New("Prop", "RayDebug End", true, [5,5], result[1], 0, 6, "#ffffff", "#000000");

			line.Destroy(5000);
			startP.Destroy(5000);
			endP.Destroy(5000);
		};

		return result;
	},



	SetupPhysics: function(obj, anc, el, fric, col, grav) {
		if (obj == undefined) {
			console.log("Requested physics setup of an undefined object.");
			return
		};

		var velocity = {     // Pixels per second
			x: 0,
			y: 0,
			r: 0,
			falling: false,
			onWall: false,

			truePosition: [0,0],

			floorFriction: 0,
			wallFriction: 0
			//HitboxSize: undefined
		};
        var newPos = {
            x: 0,
            y: 0,
            r: 0
        };

		anc = anc || false;
		el = el || 0.5;
		fric = fric || .05;
		if (col !== false && col !== true) {col = true};
		if (grav !== false && grav !== true) {grav = true};

		PhysicsProps.push({prop:obj, velo:velocity, newPos:newPos, anchored:anc, elasticity:el, friction:fric, collision:col, gravity:grav});

		obj.Velocity = velocity;
		return velocity
	},
	RemovePhysics: function(obj) {
		for (var i = 0; i < PhysicsProps.length; i++) {
			if (PhysicsProps[i].prop == obj) {
				PhysicsProps.splice(i,1);
			};
		};
		return;
	},

	StepPhysics: function(step) {
		//step = step*Physics.speed;
		//console.log(Physics.gravity*step);
        for (var i = 0; i < PhysicsProps.length; i++) {
			if (PhysicsProps[i].anchored == false) {
                var ppo = PhysicsProps[i];
                var obj = ppo.prop;
                var velocity = ppo.velo;
				var pos = obj.Position;	//Center of mass
				if (ppo.gravity == true) {
					if (Physics.gravEnabled == true) {
						velocity.y = velocity.y + (Physics.gravity*step);	//Fall
					};
					if (Physics.pgEnabled == true) {
						var dist = Vector.Distance(Physics.pgPoint, pos);
						var newGrav = Vector.MultiplyNum(Vector.Direction(Physics.pgPoint, pos), Physics.pgGrav*(1/dist));
						velocity.x = velocity.x + newGrav[0]*step;
						velocity.y = velocity.y + newGrav[1]*step;
					};
				};
				ppo.newPos.x = pos[0] + (velocity.x * step);
				ppo.newPos.y = pos[1] + (velocity.y * step);
				ppo.newPos.r = obj.Rotation + (velocity.r * step);
            };
        };
		for (var i = 0; i < PhysicsProps.length; i++) {
            var ppo = PhysicsProps[i];
			var obj = ppo.prop;
			var velocity = ppo.velo;
            var newPos = ppo.newPos;
			if (PhysicsProps[i].anchored == false) {
				var s = obj.Size;
				if (obj.Velocity.HitboxSize !== undefined){
					s = obj.Velocity.HitboxSize;
				};

				var owidth = s[0]/2;
				var oheight = s[1]/2;
				var pos = obj.Position;	//Center of mass

                var x = obj.Position[0];
				var y = obj.Position[1];
				var r = obj.Rotation;
				var newX = newPos.x;
				var newY = newPos.y;
				var newR = newPos.r;

				var falling = true;
				var onWall = false;
				var fFric = 0;
				var wFric = 0;

				if (PhysicsProps[i].collision == true) {
					for (var j = 0; j < PhysicsProps.length; j++) {
						if ((!(j == i) && (!(velocity.x == 0) || !(velocity.y == 0))) && (PhysicsProps[j].collision == true)) {
							var obj2 = PhysicsProps[j].prop;
							var elasticity = (PhysicsProps[j].elasticity + PhysicsProps[i].elasticity)/2;
							var friction = (PhysicsProps[j].friction+PhysicsProps[i].friction)/2;
							var osize = obj2.Size;
							if (obj2.Velocity.HitboxSize !== undefined){
								osize = obj2.Velocity.HitboxSize;
							};
							
							obj2 = {
								x: PhysicsProps[j].newPos.x,
								y: PhysicsProps[j].newPos.y,
								width: osize[0]/2,
								height: osize[1]/2,
								orig: obj2
							};

							var clipsX = false;
							var clipsY = false;
							/*	if ((newX > (obj2.x + obj2.width) && x < obj2.x) || (x > (obj2.x + obj2.width) && newX < obj2.x)) {
								clipsX = true;
							};
							if ((newY > (obj2.y + obj2.height) && y < obj2.y) || (y > (obj2.y + obj2.height) && newY < obj2.y)) {
								clipsY = true;
							};	*/
							var collisionData = Physics.GetTouching(obj, [x,y], obj2.orig, [obj2.x, obj2.y]);
							if (collisionData[0] == true || clipsX == true) {
								var cDir = collisionData[1];
								if (Math.floor(cDir[0]*100)/100 !== 0 && Math.sign(cDir[0]) == -Math.sign(velocity.x)){
									//newX = newX + collisionData[1][0]*owidth + collisionData[1][0]*obj2.width;
									//newX = x;
									//newX = collisionData[2][0] + owidth*(1-cDir[0]);
									newX = newX + collisionData[3][0];
									wFric = friction;
									onWall = true;
								};
								if (Math.floor(cDir[1]*100)/100 !== 0 && Math.sign(cDir[1]) == -Math.sign(velocity.y)){
									//newY = obj2.y - oheight - obj2.height;
									//newY = newY - collisionData[1][1]*oheight - collisionData[1][1]*obj2.height;
									//newY = y;
									//newY = collisionData[2][1] + oheight*(1-cDir[1]);
									newY = newY + collisionData[3][1];
									fFric = friction;
									falling = false;
								};
								PhysicsProps[j].velo.x = PhysicsProps[j].velo.x + (velocity.x*elasticity)
								velocity.x = velocity.x * (-elasticity) * ((1-friction)*cDir[1]);

								PhysicsProps[j].velo.y = PhysicsProps[j].velo.y + (velocity.y*elasticity)
								velocity.y = velocity.y * (-elasticity) * ((1-friction)*cDir[0]);
							};
						};
					};

					// Bounces off of floor
					if (newY+oheight > Physics.floor) {
						newY = Physics.floor-oheight;
						velocity.y = velocity.y * PhysicsProps[i].elasticity;	//-(PhysicsProps[i].elasticity+Physics.floorElasticity)/2;
						velocity.x = velocity.x * (1-(Physics.floorFriction+PhysicsProps[i].friction)/2);
						fFric = Physics.floorFriction;
						falling = false;
					}
				};

				if (isNaN(newX) == true){newX = obj.Position[0]};
				if (isNaN(newY) == true){newY = obj.Position[1]};
				obj.Position = [newX, newY];
                newPos.x = newX;
				newPos.y = newY;
				newPos.r = newR;
				
				obj.Rotation = newR;
				obj.Velocity.falling = falling;
				obj.Velocity.onWall = onWall;
				obj.Velocity.floorFriction = fFric;
				obj.Velocity.wallFriction = wFric;
				obj.Velocity.truePosition = obj.Position;
			};
		};
	}
};