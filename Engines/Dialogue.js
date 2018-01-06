// Made by Alan O'Cull -- AKA Masteralan or @MasterAlan2001
// Dialogue module for NPCs. Really handy.

var Dialogue = {
	box: [],
	
	Speaking: false,
	SpeakingFinished: false,
	Progress: new Event("progressDialogue"),
	
	expression: undefined,
	line1: undefined,
	line2: undefined,
	line3: undefined,
	
	Setup: function (){
		var dial = Instance.New("Prop", "Dialogue Backdrop", false);
		dial.Opacity = 1;
		dial.Color = "#444444";
		dial = Instance.SetupGUI(dial, [0.005,0.005], [0.99,0.15], true, false);



		var eBoxB = Instance.New("Prop", "ExpressionBox", false);
		eBoxB.Color = "#555555";
		eBoxB.Outline = "#777777";
		eBoxB = Instance.SetupGUI(eBoxB, [0.02,0.02], [0.12,0.12], true, false);

		var eBox = Instance.New("Image", "ExpressionBox", false);
		eBox.Color = "#555555";
		eBox.Retexture("Avatar.png");
		eBox = Instance.SetupGUI(eBox, [0.02,0.02], [0.12,0.12], true, false);


		var tBox = Instance.New("Prop", "ExpressionBox", false);
		tBox.Color = "#555555";
		tBox = Instance.SetupGUI(tBox, [0.15,0.02], [0.99-0.16,0.12], true, false);


		//Text lines
		var l1 = Instance.New("Prop", "TextLine1", false);
		l1.Opacity = 0;
		l1.Text = "";
		l1.TextColor = "#ffffff";
		Dialogue.line1 = l1;
		l1 = Instance.SetupGUI(l1, [0.15,0.02], [0.99-0.16,0.04], true, false);

		var l2 = Instance.Clone(l1.obj);
		Dialogue.line2 = l2;
		l2 = Instance.SetupGUI(l2, [0.15,0.06], [0.99-0.16,0.04], true, false);

		var l3 = Instance.Clone(l1.obj);
		Dialogue.line3 = l3;
		l3 = Instance.SetupGUI(l3, [0.15,0.1], [0.99-0.16,0.04], true, false);
		
		Dialogue.box.push(dial);
		Dialogue.box.push(eBoxB);
		Dialogue.box.push(eBox);
		Dialogue.box.push(tBox);
		Dialogue.box.push(l1);
		Dialogue.box.push(l2);
		Dialogue.box.push(l3);
	},
	ClearText: function(){
		Dialogue.line1.Text = "";
		Dialogue.line2.Text = "";
		Dialogue.line3.Text = "";
		
		return
	},
	ToggleBox: function(val){
		if (val !== true && val !== false){
			if (gui.indexOf(Dialogue.box[0]) == -1){
				val = true
			} else {
				val = false
			};
		};
		Dialogue.ClearText();
		Dialogue.box[2].obj.Retexture();
		for (var i = 0; i < Dialogue.box.length; i++){
			Dialogue.box[i].Hide(!val);
		};
		return val
	},
	
	
	
	IsPunctuation: function(c){
		if (c == "." || c == "!" || c == "?" || c == ";" || c == "," || c == "-") {return true} else {return false};
	},
	/* TEXT PROPERTIES
		obj.Font = "serif"
		obj.FontSize = 48
		obj.Text = "Hello world!"
		obj.TextOpacity = 1
		obj.TextColor = color || "#000000";
	*/
	WriteText: function(text){
		Dialogue.SpeakingFinished = false;
		var xSize = Dialogue.line1.Size[0];
		var ySize = Dialogue.line1.Size[1];
		var len = text.length;
		var tSize = ((xSize*3)/len)*3;
		if (tSize > ySize-5) {tSize = ySize-5};
		
		Dialogue.ClearText();
		Dialogue.line1.FontSize = tSize;
		Dialogue.line2.FontSize = tSize;
		Dialogue.line3.FontSize = tSize;
		
		var line = 1;
		var textLimit = Math.ceil(len/3 + .5);
		if (textLimit < 40) {
			textLimit = xSize/tSize*3;
		};
		
		var lastStep = 0;
		var lTime = 0.025;
		var pTime = 0.25;
		var nTime = lTime;
		var i = -1;
		function StepDialogue(step){
			lastStep = lastStep + step;
			if (lastStep > nTime) {
				lastStep = lastStep - nTime;
				i++;
				
				if (i >= len || line >= 4) {
					StepFunctions.splice(StepFunctions.indexOf(StepDialogue), 1);
					Dialogue.SpeakingFinished = true;
					return
				};
				
				var l = Dialogue["line"+line];
				var c = text.charAt(i);
				l.Text = (l.Text + c);
				
				if (Dialogue.IsPunctuation(c)) {
					nTime = pTime
				} else if (c == " ") {
					nTime = 0;
				} else {
					nTime = lTime
				};
				
				if (l.Text.length >= textLimit) {	//Text limit of line reached, move on.	
					line++;
					
					//Check cut-off words
					if (Dialogue.IsPunctuation(c) == false && c !== " " && text.charAt(i+1) !== " " && c !== "-" && line <= 3) {
						l.Text = (l.Text + "-");
						Dialogue["line"+line].Text = "-";
					};
					
					//If next line starts with a space, ignore it.
					if (text.charAt(i+1) == " ") {i++};
				};
			};
		};
		StepFunctions.push(StepDialogue);
		
		var eta = 0;
		for (var s = 0; s < len; s++){
			var c = text.charAt(s);
			if (Dialogue.IsPunctuation(c)) {
				eta = eta + pTime
			} else if (c !== " ") {
				eta = eta + lTime
			};
		};
		window.setTimeout(function() {
			Dialogue.SpeakingFinished = true;
		}, eta);
		return eta
	},
	Say: function(image, text, execute, execute2){
		Dialogue.SpeakingFinished = false;
		Dialogue.ClearText();
		
		Dialogue.box[2].obj.Retexture(image);
		
		var eta = Dialogue.WriteText(text);
		
		if (execute !== undefined) {execute()};
		if (execute2 !== undefined) {
			window.setTimeout( function(){execute2()}, eta)
		};
		
		return eta
	},
	RunConversation: function(conv, plrInput){
		if (plrInput !== true && plrInput !== false){plrInput = true};
		Dialogue.Speaking = true;
		Dialogue.ToggleBox(true);
		
		var f = -1;
		function RunDialogue(num){
			f++;
			if (plrInput == true && i > 0) {document.removeEventListener("progressDialogue", RunDialogue, false)};
			
			if (f >= conv.length) {
				Dialogue.Speaking = false;
				Dialogue.ToggleBox(false);
				console.log("finished conversation");
				
				return
			}
			
			var s = conv[f];
			var eta = Dialogue.Say(s[0], s[1], s[2], s[3]);
			
			window.setTimeout(function(){
				if (plrInput == true) {document.addEventListener("progressDialogue", RunDialogue, false)};
			}, eta);
			if (plrInput == false) {
				window.setTimeout(RunDialogue, 1250)
			};
			
			return
		};
		RunDialogue();
		
		return
	}
};
Dialogue.Setup();


var conver = [];
conver.push(["Avatar.png", "WHOA LOOK DIALOGUE SYSTEM!"]);
conver.push(["Avatar2.png", "That's cool... I guess."]);
conver.push(["Avatar.png", "Oh hey, didn't see you there."]);