// Made by Alan O'Cull -- AKA Masteralan or @MasterAlan2001
// Particle system that makes generation of particles much easier and faster. Also includes presets.

/*
speed = range of 2 num values
dir = vector
dirVariation = angle

acceleration = vector value in direction

rot = range of 2 num values
rotV = range of 2 num values

drag = 0 to 1 //percentage of how fast the particle slows down
rotDrag = same thing but rotation

lifetime = range of 2 num values //how long particle lasts in seconds
grav = boolean

size = [];
opac = [];
*/

var Particle = {
	emitters: [],
	list: [],

	Generate: function(obj, velo, drag, accel, rot, rotDrag, size, opac, lifetime, grav) {
		var p = [obj, drag, accel, rotDrag, 0, lifetime, opac, obj.Size, size];

		workspace.push(obj);

		var v = Physics.SetupPhysics(obj, false, 0, 0, false, grav);
		v.x = velo[0];
		v.y = velo[1];
		v.r = rot;

		/*window.setTimeout(function() {
			n = Particle.list.indexOf(p);
			if (n !== -1) {
				Particle.list.splice(n, 1);
			};

			p = undefined;
		}, lifetime-1);

		obj.Destroy(lifetime);*/

		Particle.list.push(p);
		return p
	},
	Emit: function(base, num, speed, dir, dirVar, accel, rot, rotV, drag, rotDrag, size, opac, lifetime, grav) {
		if (base == undefined){return};

		num = num || 50;
		speed = speed || [-175,-225];
		dir = dir || [0,1];
		dirVar = dirVar || 15;
		accel = accel || [0,0];
		rot = rot || [-360,360];
		rotV = rotV || [-15,15];
		drag = drag || 0;
		rotDrag = rotDrag || .125;
		size = size || [1,0.5];
		opac = opac || [1,.75,0];
		lifetime = lifetime || [1,1.5];
		//lifetime = Vector.MultiplyNum(lifetime,1000);
		if (grav !== true && grav !== false){grav = false};

		var particles = [];

		for (var i = 0; i < num; i++) {
			var obj = Instance.Clone(base);
			obj.Rotation = Random(rot[0],rot[1]);

			var dir2 = -(90-Vector.ComputeAngle(dir).Angle) + Random(-dirVar/2, dirVar/2);
			var velo = Vector.ComputeVector(Random(speed[0],speed[1]), dir2);

			particles.push(Particle.Generate(obj, velo, drag, accel, Random(rotV[0],rotV[1]), rotDrag, size, opac, Random(lifetime[0],lifetime[1]), grav));
		};

		return particles
	},
	Emitter: function(base, rate, follow) {
		if (base == undefined){return};

		var emitter = {
			obj: base,
			rate: rate || 20,
			currentTick: 0,
			follow: follow || undefined,

			speed: [175,225],
			dir: [0,-1],
			dirVar: 45,
			accel: [0,0],
			rot: [-360,360],
			rotV: [-15,15],
			drag: .0625,
			rotDrag: .0625,
			lifetime: [1,1.5],
			size: [1,.75,.25],
			opac: [1,.9,.75,0],
			grav: false
		};

		emitter.Destroy = function(time){
			time = time || 0;

			window.setTimeout(function() {
				n = Particle.emitters.indexOf(emitter);
				if (n !== -1) {
					Particle.emitters.splice(n, 1);
				};

				emitter = undefined;
			}, time);
		};

		Particle.emitters.push(emitter);
		return emitter
	},
	LoadPreset: function(preset, i, pos){
		preset = preset || "Fire";	//Preset
		i = i || 1;					//Intensity
		pos = pos || [0,0];			//Position

		var pa = undefined; var p = undefined;
		if (preset == "Fire"){
			pa = Instance.New("Prop", "Particle", false, Vector.MultiplyNum([35,35], i), pos, 0, 3, "#ff6c00");
			pa.Shadow = {
				Color: "#ff6c00",
				Blur: 25
			};
			p = Particle.Emitter(pa, 75*i);

			p.speed = Vector.MultiplyNum([100,150], -i);
			p.dir = [0,-1];
			p.accel = [0,-750];
			p.rotV = Vector.MultiplyNum([-45,45], i);
			p.dirVar = 180;
			p.drag = 0;
			p.rotDrag = .25;
			p.lifetime = Vector.Add([.5,1], Vector.MultiplyNum([0.1,0.1], i-1));

			p.size = [1.25, 1, 0.9, 0];
			p.opac = [1, 0.8, 0.625, 0.3];
		} else if (preset == "Fire2") {
			var e = Particle.LoadPreset("Fire", i, pos);
			pa = e[1];
			p = e[0];

			pa.Color = "#ffe825";
			pa.Resize(Vector.MultiplyNum([30,30], i), 5);

			p.speed = Vector.MultiplyNum([200,250], -i);
			p.dirVar = 110;
			p.accel = [0,-750];
			p.drag = 0.25;

			p.size = [1.25, 1, 0.9, 0.5];
			p.opac = [1, 0.75, 0.625, 0];
		} else if (preset == "Fire3") {
			var e = Particle.LoadPreset("Fire", i, pos);
			pa = e[1];
			p = e[0];

			pa.Color = "#ffb400";
			pa.Resize(Vector.MultiplyNum([32.5,32.5], i), 4);

			p.speed = Vector.MultiplyNum([300,350], -i);
			p.dirVar = 100;
			p.accel = [0,-600];
			p.drag = 0.75;
			p.rotV = Vector.MultiplyNum([-360,360], i);
			p.rotDrag = -.25;

			p.size = [1.25, .9, 0.625, 0.25];
			p.opac = [.9, 0.75, 0.625, 0];


		} else if (preset == "Water"){
			pa = Instance.New("Prop", "Particle", false, Vector.MultiplyNum([25,25], i), pos, 0, 8, "#50A6C2");
			p = Particle.Emitter(pa, 50*i);

			p.speed = Vector.MultiplyNum([250,275], i);
			p.dir = [0,-1];
			p.accel = [0,350];
			p.rotV = Vector.MultiplyNum([-360,360], i);
			p.dirVar = 50/i;
			p.drag = .125;
			p.rotDrag = .125;
			p.lifetime = Vector.Add([1.25,1.75], Vector.MultiplyNum([0.5,0.5], i-1));

			p.size = [.625, .75, 0.9, 2];
			p.opac = [1, 0.75, 0.35, 0];
		};

		return [p, pa];
	},



	TickEmitters: function(step){
		for (var i = 0; i < Particle.emitters.length; i++){
			var e = Particle.emitters[i];

			var rate = 1/e.rate;
			e.currentTick = e.currentTick + step;

			if (e.currentTick >= rate) {
				var d = Math.ceil(e.currentTick/rate)-1;
				//console.log("tick = " + e.currentTick);
				//console.log(d);
				for (var x = 0; x < d; x++){
					e.currentTick = e.currentTick - rate;
					Particle.Emit(e.obj, 1, e.speed, e.dir, e.dirVar, e.accel, e.rot, e.rotV, e.drag, e.rotDrag, e.size, e.opac, e.lifetime, e.grav);
				};
				//console.log("tick2 = " + e.currentTick);
			}
		}
	},
	TickParticles: function(step){
		for (var i = 0; i < Particle.list.length; i++){
			var p = Particle.list[i];
			var o = p[0];

			p[4] = p[4] + step;

			if (p[4] >= p[5]) {
				n = Particle.list.indexOf(p);
				if (n !== -1) {
					Particle.list.splice(n, 1);
				};
				o.Destroy();
				p = undefined;
			} else {
				var v = o.Velocity;
				var vd = (1-(p[1]*step));
				v.x = v.x*vd;
				v.y = v.y*vd;
				v.r = v.r*(1-p[3]*step);

				v.x = v.x + (p[2])[0]*step;
				v.y = v.y + (p[2])[1]*step;

				var lp = (p[4]/p[5]);
				o.Opacity = NumberListPosition(p[6], lp);
				o.Resize(Vector.MultiplyNum(p[7], NumberListPosition(p[8], lp)));

				/*	if (i == 0){
					//console.log(o.Opacity);
					console.log(o.Size);
				};	*/
			}
		}
	}
}
StepFunctions.push(Particle.TickEmitters);
StepFunctions.push(Particle.TickParticles);
