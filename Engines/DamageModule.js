// Made by Alan O'Cull -- AKA Masteralan or MasterAlan2001
// Damaging module, allows dealing damage in given hitboxes as well as callback functions

var Damaging = {
	Objects: [],
	Auras: [],
	ShowHitboxes: false,	//Generates flash of where weapon would hit when swung

	RenderHitbox: function(hitbox){
		if (Damaging.ShowHitboxes == false){return};
		var vertices = 4;
		var size = hitbox.Size;
		if (hitbox.IsCircle == true){
			vertices = 50;
			size = [size, size];
		};

		var box = Instance.New("Prop", "Damage Hitbox", true, size, hitbox.Position, 0, vertices, "#fffffff");
		box.Opacity = .75;

		var fade = function(step){
			box.Opacity = box.Opacity - step*5;

			if (box.Opacity <= 0){
				box.Destroy();
				n = StepFunctions.indexOf(fade);
				if (n !== -1) {
					StepFunctions.splice(n, 1);
				};
			};
			return
		};
		StepFunctions.push(fade);
	},

	Hitbox: function(pos, circle, size, damage, callback, run){
		if (circle == true && typeof size !== "number") {
			size = size[0] || 50;
		} else {
			size = size || [50,50];
		};
		if (run !== true && run !== false) {
			run = true;
		};

		var box = {
			Position: pos || [0,0],
			IsCircle: circle || false,
			Size: size,
			Damage: damage || 5,
			Callback: callback || []
		};

		return box;
	},
	Aura: function(pos, circle, size, rate, callback, follow) {	//Rate is in full seconds
		var aoe = {
			Object: Damaging.Hitbox(pos, circle, size, 0, callback, false),
			Rate: rate || 3,
			Follow: follow || undefined
		}

		Damaging.Auras.push(aoe);

		aoe.Destroy = function() {
			var n = Damaging.Auras.Auras.indexOf(aoe);
			if (n !== -1) {
				Damaging.Auras.splice(n, 1);
			};

			aoe = undefined;
			return undefined
		};

		return aoe;
	},



	SetupDamaging: function(obj, hp, regen, resistNorm, defense, crit, miss, dodge) {
		var DamageStats = {
			Resistance: resistNorm || 0,
			Defense: defense || 0,
			CritChance: crit || 1,
			MissChance: miss || 0,
			DodgeChance: dodge || 0,
			Resistances: [],

			LastAttacked: undefined,	//Good for abilities and such, not very useful otherwise
			LastHit: undefined,			//For kill-counting and such
			Assist: undefined			//For kill-counting, pretty much ony useful for PVP though
		};

		if (obj.Health == undefined) {
			obj.MaxHealth = hp || 100;
			obj.Health = hp || 100;
			obj.HealthRegeneration = regen || 0;
			obj.AllowOverheal = true;
		};

		obj.DamageStats = DamageStats;
		Damaging.Objects.push(obj);

		return DamageStats
	},
	DealDamage: function(hit, dmg, attacker, type) {
		if (hit == undefined || dmg == 0) {return 0};
		var damage = dmg;
		type = type || "Normal";

		if (hit.DamageStats !== undefined && dmg > 0) {
			if (type == "Normal") {
				dmg = dmg - hit.DamageStats.Defense;
				if (dmg <= 0) {return 0};

				dmg = dmg * (1 - (hit.DamageStats.Resistance/100));
				if (dmg == 0) {return 0};
			};
		};
		if (attacker !== undefined && attacker.DamageStats !== undefined && dmg > 0) {
			var crit = Math.ceil(Random(attacker.DamageStats.CritChance,100)-100)/100 + 1;	//1 if no more than 100, 2 if reg, 3 if double, 4, etc
			dmg = dmg*crit;	//If crits are extreme (i.e. 3) then damage can be trippled or quadrupled

			if (attacker.DamageStats.MissChance > 0) {
				var miss = Random(attacker.DamageStats.MissChance,100)/100
				if (miss >= 1) {
					dmg = 0;
				};
			};

			if (dmg > 0) {attacker.DamageStats.LastAttacked = hit};
		};

		if (hit.DamageStats !== undefined && dmg > 0 && attacker !== undefined) {
			var assist = hit.LastHit;
			hit.LastHit = attacker;

			if (assist !== attacker); {
				hit.Assist = assist;
			};
		};
		hit.Health = hit.Health - dmg;
		return dmg;
	},


	GetHit: function(box, radius, pos, size, vertices) {
		if (box == undefined && radius !== true) {return};

		radius = radius || false;
		pos = pos || box.Position || [0,0];
		size = size || 50;
		vertices = vertices || false;

		var tl = [0,0];
		var br = [0,0];
		if (box !== undefined && box.IsCircle == false) {
			tl = Vector.Subtract(box.Position,Vector.DivideNum(box.Size, 2));
			br = Vector.Add(box.Position,Vector.DivideNum(box.Size, 2));
			//console.log("HitBox: " + tl + "; " + br);
		};

		if (Damaging.ShowHitboxes == true){
			Damaging.RenderHitbox(box);
		};

		var hit = [];

		for (o = 0; o < Damaging.Objects.length; o++) {
			var obj = Damaging.Objects[o];
            var p = obj.Position;
			//console.log(obj.Name);
			
			var hb2 = Vector.GetHitboxCorners(obj.Vertices);
			var tl2 = hb2[0];
			var br2 = hb2[3];

     		for (i = -1; i < obj.Vertices.length; i++) {
                    if (i == -1){
                         var v = p;
                    } else {
                         var v = Vector.Add(p, obj.Vertices[i]);
                    };

     			if (box !== undefined && obj.Rotation !== 0) {
     				v = Vector.RotateVector(v,obj.Rotation);
     			};

     			if (radius == true && vertices == false) {
     				var dist = Vector.Magnitude(Vector.Subtract(obj.Postion,pos));
     				if (dist <= size) {
     					hit.push({hit: obj, distance: dist});
     				};
     				break
     			} else if (radius == true && Vector.Magnitude(Vector.Subtract(obj.Vertices[i],pos)) <= size) {
     				hit.push({hit: obj, distance: Vector.Magnitude(Vector.Subtract(obj.Position,pos))});
     				break	//Ends current loop because object is already logged

     			} else if (v !== undefined) {     //Box collision, completely inside of hitbox
					//console.log("Checking " + v);
					if (v[0] >= tl[0] && v[0] <= br[0] && v[1] >= tl[1] && v[1] <= br[1]) {
						hit.push({hit: obj, distance: Vector.Magnitude(Vector.Subtract(obj.Position,box.Position))});
						//console.log("Touched at " + obj.Vertices[i]);
						break
					} else if ((br2[0] >= tl[0] && tl2[0] <= tl[0] && br2[1] >= tl[1] && tl2[1] <= tl[1]) || (br2[0] >= br[0] && tl2[0] <= br[0] && br2[1] >= br[1] && tl2[1] <= br[1])){
						hit.push({hit: obj, distance: Vector.Magnitude(Vector.Subtract(obj.Position,box.Position))});
					}
     			}
               };
		};
          //console.log(hit);
		return hit;		//Format: hit = [{obj: Object, distance: #},	{etc}];
	},


	HealthRegen: function(step) {
		for (i = 0; i < Damaging.Objects.length; i++) {
			var obj = Damaging.Objects[i];


			// Regeneration
			if (obj.HealthRegeneration !== undefined && obj.Health !== undefined && obj.Health > 0 && (obj.MaxHealth == undefined || obj.Health < obj.MaxHealth)) {
				obj.Health = obj.Health + obj.HealthRegeneration*step;
				if (obj.MaxHealth !== undefined && obj.Health > obj.MaxHealth) {obj.Health = obj.MaxHealth};
			};


			// Overheal
			if (obj.Health > obj.MaxHealth) {
				if (obj.AllowOverheal == false) {obj.Health = obj.MaxHealth} else {
					obj.Health = obj.Health - step;	//Or should I use lerp?
					if (obj.Health < obj.MaxHealth) {obj.Health = obj.MaxHealth};
				}
			} else if (obj.Health < 0) {
				obj.Health = 0
			};
		}
	}
}
StepFunctions.push(Damaging.HealthRegen);

/*
var bax = Instance.New("Prop", "Hitbox Testing", true, [50,50], [0,250], 0, 4);
Damaging.SetupDamaging(bax, 100, false);

var hit = Damaging.Hitbox([0,500], false,[500,500]);
var hit2 = Damaging.GetHit(hit);
Damaging.DealDamage(hit2[0].hit, 12.5);
*/
